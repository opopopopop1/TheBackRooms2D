-- ============================================================
-- 后室 · 挤号申请（同账号同时只登一个网页）
--
-- 第二个想登同一个号 -> 发申请（填理由）；已登录那一边同意后才放行。
-- 用法：控制台 → SQL → 整段粘贴执行（接在 cloudbase-rpc.sql 之后）。
-- 这份脚本不含任何省略号，可以直接整段复制。
-- ============================================================

-- ---------- 在线表加一列会话 id：用来分辨"是不是同一个网页" ----------
ALTER TABLE IF EXISTS public.br_online ADD COLUMN IF NOT EXISTS sess text;

CREATE INDEX IF NOT EXISTS br_online_sess_idx ON public.br_online (sess);
CREATE INDEX IF NOT EXISTS br_online_nick_idx ON public.br_online (lower(nick));

-- ---------- 先删旧版本（返回类型可能是 void）----------
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('br_heartbeat', 'br_session_live',
                        'br_login_req', 'br_login_poll',
                        'br_login_reply', 'br_login_check')
  LOOP
    EXECUTE 'DROP FUNCTION ' || r.sig || ' CASCADE';
  END LOOP;
END $$;

-- ---------- 心跳：多带一个会话 id ----------
CREATE OR REPLACE FUNCTION public.br_heartbeat(p_token text, p_nick text, p_sess text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE k text;
BEGIN
  k := COALESCE(NULLIF(p_token, ''), 'anon:' || COALESCE(NULLIF(p_sess, ''), 'x'));
  -- 只保留 90 秒内的记录
  DELETE FROM public.br_online WHERE seen_at < now() - interval '90 seconds';
  INSERT INTO public.br_online (token, nick, sess, seen_at)
  VALUES (k, COALESCE(p_nick, ''), COALESCE(p_sess, ''), now())
  ON CONFLICT (token) DO UPDATE
    SET nick = EXCLUDED.nick, sess = EXCLUDED.sess, seen_at = now();
  RETURN json_build_object('ok', true);
END;
$$;

-- ---------- 这个昵称现在有没有"别的网页"在用 ----------
CREATE OR REPLACE FUNCTION public.br_session_live(p_nick text, p_self text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE n integer;
BEGIN
  DELETE FROM public.br_online WHERE seen_at < now() - interval '90 seconds';
  SELECT COUNT(*) INTO n
  FROM public.br_online
  WHERE lower(nick) = lower(COALESCE(p_nick, ''))
    AND COALESCE(nick, '') <> ''
    AND COALESCE(sess, '') <> COALESCE(p_self, '');
  RETURN json_build_object('live', n);
END;
$$;

-- ---------- 申请 / 轮询 / 应答 / 查结果 ----------
CREATE TABLE IF NOT EXISTS public.br_login_req (
  req_id   text PRIMARY KEY,
  nick     text NOT NULL,
  reason   text,
  state    text NOT NULL DEFAULT 'pending',   -- pending / ok / no / gone
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS br_login_req_nick_idx ON public.br_login_req (lower(nick), state);

-- 发申请
CREATE OR REPLACE FUNCTION public.br_login_req(p_nick text, p_req_id text, p_reason text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 2 分钟前的申请清掉，别攒一堆
  DELETE FROM public.br_login_req WHERE created_at < now() - interval '10 minutes';
  INSERT INTO public.br_login_req (req_id, nick, reason, state, created_at)
  VALUES (p_req_id, COALESCE(p_nick, ''), COALESCE(p_reason, ''), 'pending', now())
  ON CONFLICT (req_id) DO UPDATE SET reason = EXCLUDED.reason, created_at = now();
  RETURN json_build_object('ok', true);
END;
$$;

-- 已登录那一边：有没有待处理的申请
CREATE OR REPLACE FUNCTION public.br_login_poll(p_nick text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE r record;
BEGIN
  SELECT req_id, reason INTO r
  FROM public.br_login_req
  WHERE lower(nick) = lower(COALESCE(p_nick, '')) AND state = 'pending'
  ORDER BY created_at ASC LIMIT 1;
  IF r.req_id IS NULL THEN RETURN json_build_object('req_id', NULL); END IF;
  RETURN json_build_object('req_id', r.req_id, 'reason', r.reason);
END;
$$;

-- 已登录那一边：同意 / 拒绝
CREATE OR REPLACE FUNCTION public.br_login_reply(p_req_id text, p_accept boolean)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.br_login_req
  SET state = CASE WHEN COALESCE(p_accept, false) THEN 'ok' ELSE 'no' END
  WHERE req_id = p_req_id AND state = 'pending';
  RETURN json_build_object('ok', true);
END;
$$;

-- 申请方：查自己的申请结果
CREATE OR REPLACE FUNCTION public.br_login_check(p_req_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE st text;
BEGIN
  DELETE FROM public.br_login_req WHERE created_at < now() - interval '10 minutes';
  SELECT state INTO st FROM public.br_login_req WHERE req_id = p_req_id;
  RETURN json_build_object('state', COALESCE(st, 'gone'));
END;
$$;

-- ---------- 授权给匿名角色（PublishableKey 走的就是 anon）----------
DO $$
BEGIN
  BEGIN
    GRANT USAGE ON SCHEMA public TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.br_online TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.br_login_req TO anon;
    GRANT EXECUTE ON FUNCTION public.br_heartbeat(text, text, text) TO anon;
    GRANT EXECUTE ON FUNCTION public.br_session_live(text, text) TO anon;
    GRANT EXECUTE ON FUNCTION public.br_login_req(text, text, text) TO anon;
    GRANT EXECUTE ON FUNCTION public.br_login_poll(text) TO anon;
    GRANT EXECUTE ON FUNCTION public.br_login_reply(text, boolean) TO anon;
    GRANT EXECUTE ON FUNCTION public.br_login_check(text) TO anon;
  EXCEPTION WHEN undefined_object THEN
    NULL;    -- 没有 anon 角色就跳过，在控制台手动授权即可
  END;
END $$;
