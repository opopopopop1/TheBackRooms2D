
-- ===========================================================
-- 云存档：记住玩家退出前所在的层级与位置
-- （接在 cloudbase-rpc.sql 之后执行；执行完记得把下面两个函数
--   加进网关的允许列表，和 br_* 那批一样）
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.br_slots (
  user_id  integer PRIMARY KEY REFERENCES public.br_users(id) ON DELETE CASCADE,
  slot     jsonb      NOT NULL DEFAULT '{}'::jsonb,
  saved_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.br_slot_get(p_token text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE uid integer; s jsonb;
BEGIN
  SELECT id INTO uid FROM public.br_users WHERE token = p_token;
  IF uid IS NULL THEN RETURN json_build_object('ok', false, 'msg', '未登录'); END IF;
  SELECT slot INTO s FROM public.br_slots WHERE user_id = uid;
  RETURN json_build_object('ok', true, 'slot', COALESCE(s, '{}'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION public.br_slot_put(p_token text, p_slot jsonb)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE uid integer;
BEGIN
  SELECT id INTO uid FROM public.br_users WHERE token = p_token;
  IF uid IS NULL THEN RETURN json_build_object('ok', false, 'msg', '未登录'); END IF;
  -- 传 null 表示删掉这份云存档
  IF p_slot IS NULL THEN
    DELETE FROM public.br_slots WHERE user_id = uid;
    RETURN json_build_object('ok', true, 'cleared', true);
  END IF;
  INSERT INTO public.br_slots(user_id, slot, saved_at)
    VALUES (uid, p_slot, now())
  ON CONFLICT (user_id) DO UPDATE SET slot = EXCLUDED.slot, saved_at = now();
  RETURN json_build_object('ok', true);
END;
$$;

DO $$
BEGIN
  BEGIN
    GRANT EXECUTE ON FUNCTION public.br_slot_get(text) TO anon;
    GRANT EXECUTE ON FUNCTION public.br_slot_put(text, jsonb) TO anon;
  EXCEPTION WHEN undefined_object THEN NULL;   -- 没有 anon 角色就跳过
  END;
END $$;
