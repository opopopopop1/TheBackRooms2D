-- ============================================================
-- 后室 · 联机房间（CloudBase 数据模型 RPC 版）
--
-- 前端直连数据库，房间列表 / 房间号 / 建房间 / 进房间 / 握手信号
-- 全都走这几个函数。真正的游戏数据走 WebRTC 点对点，不经过数据库。
--
-- 用法：控制台 → SQL → 整段粘贴执行（接在 cloudbase-rpc.sql 之后也行）。
-- 这份脚本不含任何省略号，可以直接整段复制。
-- ============================================================

-- ---------- 表 ----------
CREATE TABLE IF NOT EXISTS public.br_rooms (
  code        text PRIMARY KEY,
  name        text NOT NULL,
  host_token  text NOT NULL,
  pub         boolean NOT NULL DEFAULT true,   -- 公开 / 私人
  max_players integer NOT NULL DEFAULT 4,
  created_at  timestamptz NOT NULL DEFAULT now(),
  seen_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.br_room_members (
  code       text NOT NULL,
  token      text NOT NULL,
  nick       text,
  is_host    boolean NOT NULL DEFAULT false,
  seen_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (code, token)
);

-- 握手信号：WebRTC 的 offer / answer / candidate 临时存在这里，被取走即删
CREATE TABLE IF NOT EXISTS public.br_room_signal (
  id       bigserial PRIMARY KEY,
  code     text NOT NULL,
  from_tok text NOT NULL,
  to_tok   text NOT NULL,            -- '*' 表示广播给全房间
  payload  jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS br_room_signal_idx
  ON public.br_room_signal (code, to_tok, id);

-- ---------- 先删旧版本（返回类型可能是 void）----------
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('br_room_create', 'br_room_list', 'br_room_join',
                        'br_room_leave', 'br_room_send', 'br_room_recv',
                        'br_room_touch')
  LOOP
    EXECUTE 'DROP FUNCTION ' || r.sig || ' CASCADE';
  END LOOP;
END $$;

-- ---------- 建房间 ----------
-- 房间号由前端生成（4 位数字，好念好输），也可以让数据库生成：
-- 把 p_code 传 NULL，这里会自己找一个没人用的。
CREATE OR REPLACE FUNCTION public.br_room_create(
  p_token text, p_name text, p_code text,
  p_pub boolean, p_max integer, p_nick text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_max  integer;
BEGIN
  IF p_token IS NULL OR p_token = '' THEN
    RETURN json_build_object('ok', false, 'msg', '缺少身份标识');
  END IF;

  v_max := GREATEST(2, LEAST(8, COALESCE(p_max, 4)));   -- 最低 2 人，最高 8 人
  v_code := NULLIF(btrim(COALESCE(p_code, '')), '');

  IF v_code IS NULL THEN
    -- 数据库自己找一个 4 位房间号
    FOR i IN 1..200 LOOP
      v_code := lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.br_rooms WHERE code = v_code);
      v_code := NULL;
    END LOOP;
    IF v_code IS NULL THEN
      RETURN json_build_object('ok', false, 'msg', '房间号用完了，请重试');
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM public.br_rooms WHERE code = v_code) THEN
    RETURN json_build_object('ok', false, 'msg', '这个房间号已经有人用了');
  END IF;

  INSERT INTO public.br_rooms (code, name, host_token, pub, max_players)
  VALUES (v_code, COALESCE(NULLIF(btrim(p_name), ''), '未命名房间'),
          p_token, COALESCE(p_pub, true), v_max);

  INSERT INTO public.br_room_members (code, token, nick, is_host)
  VALUES (v_code, p_token, p_nick, true);

  RETURN json_build_object('ok', true, 'code', v_code, 'max', v_max);
END;
$$;

-- ---------- 房间列表 ----------
-- 只返回公开的房间；私人房间不出现在列表里，只能输房间号进。
-- 超过 5 分钟没心跳的房间自动清掉。
CREATE OR REPLACE FUNCTION public.br_room_list()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.br_rooms WHERE seen_at < now() - interval '5 minutes';
  DELETE FROM public.br_room_members m
    WHERE NOT EXISTS (SELECT 1 FROM public.br_rooms r WHERE r.code = m.code);
  DELETE FROM public.br_room_signal WHERE created_at < now() - interval '5 minutes';

  RETURN (
    SELECT COALESCE(json_agg(x), '[]'::json)
    FROM (
      SELECT r.code, r.name, r.max_players AS max,
             r.host_token = m.token AS mine,
             (SELECT count(*) FROM public.br_room_members mm WHERE mm.code = r.code) AS n
      FROM public.br_rooms r
      LEFT JOIN public.br_room_members m ON m.code = r.code
      WHERE r.pub AND r.seen_at > now() - interval '5 minutes'
      ORDER BY r.created_at DESC
      LIMIT 50
    ) x
  );
END;
$$;

-- ---------- 加进房间 ----------
CREATE OR REPLACE FUNCTION public.br_room_join(
  p_code text, p_token text, p_nick text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r    record;
  v_n  integer;
BEGIN
  SELECT code, name, host_token, max_players, pub INTO r
  FROM public.br_rooms WHERE code = btrim(COALESCE(p_code, ''));

  IF r.code IS NULL THEN
    RETURN json_build_object('ok', false, 'msg', '没有这个房间号');
  END IF;

  SELECT count(*) INTO v_n FROM public.br_room_members WHERE code = r.code;
  IF v_n >= r.max_players AND NOT EXISTS (
    SELECT 1 FROM public.br_room_members WHERE code = r.code AND token = p_token
  ) THEN
    RETURN json_build_object('ok', false, 'msg', '房间满了');
  END IF;

  INSERT INTO public.br_room_members (code, token, nick, is_host)
  VALUES (r.code, p_token, p_nick, r.host_token = p_token)
  ON CONFLICT (code, token) DO UPDATE
    SET seen_at = now(), nick = EXCLUDED.nick;

  UPDATE public.br_rooms SET seen_at = now() WHERE code = r.code;

  RETURN json_build_object(
    'ok', true, 'code', r.code, 'name', r.name,
    'isHost', r.host_token = p_token,
    'hostToken', r.host_token, 'max', r.max_players, 'pub', r.pub
  );
END;
$$;

-- ---------- 心跳：让房间别被清掉，顺便拿最新成员表 ----------
CREATE OR REPLACE FUNCTION public.br_room_touch(p_code text, p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.br_room_members SET seen_at = now()
    WHERE code = p_code AND token = p_token;
  UPDATE public.br_rooms SET seen_at = now() WHERE code = p_code;
  DELETE FROM public.br_room_members
    WHERE code = p_code AND seen_at < now() - interval '60 seconds';

  RETURN (
    SELECT COALESCE(json_agg(json_build_object(
             'token', m.token, 'nick', m.nick, 'host', m.is_host
           ) ORDER BY m.is_host DESC, m.seen_at), '[]'::json)
    FROM public.br_room_members m WHERE m.code = p_code
  );
END;
$$;

-- ---------- 发信号（WebRTC 握手用）----------
CREATE OR REPLACE FUNCTION public.br_room_send(
  p_code text, p_from text, p_to text, p_payload jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.br_room_signal (code, from_tok, to_tok, payload)
  VALUES (p_code, p_from, COALESCE(NULLIF(p_to, ''), '*'), COALESCE(p_payload, '{}'::jsonb));
  RETURN json_build_object('ok', true);
END;
$$;

-- ---------- 收信号（取走即删）----------
CREATE OR REPLACE FUNCTION public.br_room_recv(p_code text, p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_items json;
BEGIN
  SELECT COALESCE(json_agg(json_build_object(
           'from', s.from_tok, 'payload', s.payload
         ) ORDER BY s.id), '[]'::json)
  INTO v_items
  FROM public.br_room_signal s
  WHERE s.code = p_code AND (s.to_tok = p_token OR s.to_tok = '*')
    AND s.from_tok <> p_token;

  DELETE FROM public.br_room_signal s
  WHERE s.code = p_code AND (s.to_tok = p_token OR s.to_tok = '*')
    AND s.from_tok <> p_token;

  RETURN v_items;
END;
$$;

-- ---------- 离开房间 ----------
CREATE OR REPLACE FUNCTION public.br_room_leave(p_code text, p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_host text;
BEGIN
  SELECT host_token INTO v_host FROM public.br_rooms WHERE code = p_code;
  DELETE FROM public.br_room_members WHERE code = p_code AND token = p_token;
  DELETE FROM public.br_room_signal
    WHERE code = p_code AND (from_tok = p_token OR to_tok = p_token);

  -- 房主走了就把房间关掉
  IF v_host IS NOT NULL AND v_host = p_token THEN
    DELETE FROM public.br_room_members WHERE code = p_code;
    DELETE FROM public.br_room_signal WHERE code = p_code;
    DELETE FROM public.br_rooms WHERE code = p_code;
  END IF;

  RETURN json_build_object('ok', true);
END;
$$;

-- ---------- 授权给 anon ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA public TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_room_create(text,text,text,boolean,integer,text) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_room_list() TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_room_join(text,text,text) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_room_touch(text,text) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_room_send(text,text,text,jsonb) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_room_recv(text,text) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_room_leave(text,text) TO anon';
  END IF;
END $$;
