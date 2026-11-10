-- ============================================================
-- 后室 · CloudBase 数据模型 RPC 版
-- 前端直连数据库，不需要 Node 后端 / 云函数。
--
-- 用法：CloudBase 控制台 → 数据模型 → SQL → 整段粘贴执行。
--
-- 注意：这份脚本里没有任何省略号，可以直接整段复制。
-- 之前报 syntax error at or near ".." 是因为示例里我写了 "..." 占位。
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- 表 ----------
CREATE TABLE IF NOT EXISTS public.br_users (
  id         bigserial PRIMARY KEY,
  nick       text UNIQUE NOT NULL,
  pwd_hash   text NOT NULL,
  token      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.br_saves (
  user_id    bigint PRIMARY KEY REFERENCES public.br_users(id) ON DELETE CASCADE,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.br_online (
  token     text PRIMARY KEY,
  nick      text,
  last_seen timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS br_online_seen_idx ON public.br_online (last_seen);

-- ---------- 先删掉旧的 void 版本 ----------
-- 重点：CREATE OR REPLACE **不能**把 void 改成 json（会报
-- "cannot change return type of existing function"），必须先 DROP。
-- 下面这段自动找出所有 br_* 函数并删掉，不用管原来的参数签名是什么。
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('br_register', 'br_login', 'br_get_save',
                        'br_put_save', 'br_heartbeat', 'br_online')
  LOOP
    EXECUTE 'DROP FUNCTION ' || r.sig || ' CASCADE';
  END LOOP;
END $$;

-- ---------- 注册 ----------
CREATE OR REPLACE FUNCTION public.br_register(p_nick text, p_pwd text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id    bigint;
  v_token text;
BEGIN
  IF p_nick IS NULL OR length(btrim(p_nick)) < 1 THEN
    RETURN json_build_object('ok', false, 'msg', '昵称不能为空');
  END IF;
  IF p_pwd IS NULL OR length(p_pwd) < 4 THEN
    RETURN json_build_object('ok', false, 'msg', '密码至少 4 位');
  END IF;
  IF EXISTS (SELECT 1 FROM public.br_users WHERE nick = btrim(p_nick)) THEN
    RETURN json_build_object('ok', false, 'msg', '这个昵称已经被占用了');
  END IF;

  v_token := encode(gen_random_bytes(24), 'hex');
  INSERT INTO public.br_users (nick, pwd_hash, token)
  VALUES (btrim(p_nick), crypt(p_pwd, gen_salt('bf', 8)), v_token)
  RETURNING id INTO v_id;

  INSERT INTO public.br_saves (user_id, data) VALUES (v_id, '{}'::jsonb);

  RETURN json_build_object('ok', true, 'token', v_token, 'nick', btrim(p_nick));
END;
$$;

-- ---------- 登录 ----------
CREATE OR REPLACE FUNCTION public.br_login(p_nick text, p_pwd text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r       record;
  v_token text;
BEGIN
  SELECT id, nick, pwd_hash INTO r
  FROM public.br_users
  WHERE nick = btrim(p_nick);

  IF r.id IS NULL THEN
    RETURN json_build_object('ok', false, 'msg', '没有这个昵称');
  END IF;
  IF r.pwd_hash IS NULL OR r.pwd_hash <> crypt(p_pwd, r.pwd_hash) THEN
    RETURN json_build_object('ok', false, 'msg', '密码不对');
  END IF;

  v_token := encode(gen_random_bytes(24), 'hex');
  UPDATE public.br_users SET token = v_token WHERE id = r.id;

  RETURN json_build_object('ok', true, 'token', v_token, 'nick', r.nick);
END;
$$;

-- ---------- 拉取存档 ----------
CREATE OR REPLACE FUNCTION public.br_get_save(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r record;
BEGIN
  SELECT u.nick, s.data INTO r
  FROM public.br_users u
  LEFT JOIN public.br_saves s ON s.user_id = u.id
  WHERE u.token = p_token;

  IF r.nick IS NULL THEN
    RETURN json_build_object('ok', false, 'msg', '登录已失效，请重新登录');
  END IF;

  RETURN json_build_object('ok', true, 'nick', r.nick,
                           'data', COALESCE(r.data, '{}'::jsonb));
END;
$$;

-- ---------- 上传存档 ----------
-- 说明：整体覆盖。并集合并由前端负责（先 get、合并、再 put），
-- 这样换设备登录不会丢进度，逻辑也最好查。
CREATE OR REPLACE FUNCTION public.br_put_save(p_token text, p_data jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id bigint;
BEGIN
  SELECT id INTO v_id FROM public.br_users WHERE token = p_token;
  IF v_id IS NULL THEN
    RETURN json_build_object('ok', false, 'msg', '登录已失效，请重新登录');
  END IF;

  INSERT INTO public.br_saves (user_id, data, updated_at)
  VALUES (v_id, COALESCE(p_data, '{}'::jsonb), now())
  ON CONFLICT (user_id) DO UPDATE
    SET data = EXCLUDED.data, updated_at = now();

  RETURN json_build_object('ok', true);
END;
$$;

-- ---------- 在线心跳 ----------
CREATE OR REPLACE FUNCTION public.br_heartbeat(p_token text, p_nick text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_token IS NULL OR p_token = '' THEN
    RETURN json_build_object('ok', false, 'msg', '没有 token');
  END IF;

  INSERT INTO public.br_online (token, nick, last_seen)
  VALUES (p_token, p_nick, now())
  ON CONFLICT (token) DO UPDATE
    SET last_seen = now(),
        nick = COALESCE(EXCLUDED.nick, public.br_online.nick);

  RETURN json_build_object('ok', true);
END;
$$;

-- ---------- 在线人数 ----------
-- 90 秒内有心跳的都算在线（登录的和游客都算）。
-- 如果你的 RPC 走的是只读事务，把下面那行 DELETE 删掉即可，
-- 统计本身不受影响，只是表里会慢慢积一点旧数据。
CREATE OR REPLACE FUNCTION public.br_online()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_n bigint;
BEGIN
  DELETE FROM public.br_online WHERE last_seen < now() - interval '90 seconds';
  SELECT count(*) INTO v_n FROM public.br_online;
  RETURN json_build_object('ok', true, 'n', v_n);
END;
$$;

-- ---------- 授权给 anon（PublishableKey 用的就是它）----------
-- 用 DO 包起来：如果你的环境里没有 anon 这个角色，这段会自动跳过而不是报错。
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA public TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_register(text, text) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_login(text, text) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_get_save(text) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_put_save(text, jsonb) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_heartbeat(text, text) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_online() TO anon';
  END IF;
END $$;
