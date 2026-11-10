-- ============================================================
-- 通关率排行榜
--
-- 玩家（登录与否都算）每进出一层，就会往这里记一笔：
--   tries  进过这一层的次数
--   clears 从这一层活着走出去的次数
-- 通关率 = clears / tries，在右上角「排行榜」里按百分比 + 真实数字显示。
--
-- 用法：整份在 CloudBase 控制台的 SQL 窗口里执行一遍，
--      然后把 br_rate_put / br_rate_get 两个函数加进网关的允许列表。
-- ============================================================

-- 旧版本残留（改返回类型时 CREATE OR REPLACE 不允许，先清一遍）
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('br_rate_put', 'br_rate_get')
  LOOP
    EXECUTE 'DROP FUNCTION ' || r.sig || ' CASCADE';
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS public.br_rate (
  lvl        text PRIMARY KEY,
  tries      bigint NOT NULL DEFAULT 0,
  clears     bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- 记一笔 ----------
-- p_clear = true  表示"通关了这一层"；false 表示"只是进去过（死在里面 / 没走出来）"
CREATE OR REPLACE FUNCTION public.br_rate_put(p_lvl text, p_clear boolean)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lvl text := left(coalesce(p_lvl, ''), 24);
BEGIN
  IF v_lvl = '' THEN
    RETURN json_build_object('ok', false, 'msg', '层级为空');
  END IF;
  INSERT INTO public.br_rate (lvl, tries, clears, updated_at)
  VALUES (v_lvl, 1, CASE WHEN p_clear THEN 1 ELSE 0 END, now())
  ON CONFLICT (lvl) DO UPDATE SET
    tries      = public.br_rate.tries + 1,
    clears     = public.br_rate.clears + CASE WHEN p_clear THEN 1 ELSE 0 END,
    updated_at = now();
  RETURN json_build_object('ok', true);
END;
$$;

-- ---------- 拉榜单 ----------
-- 返回按通关率从高到低排好的数组，含百分比和真实数字
CREATE OR REPLACE FUNCTION public.br_rate_get()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT json_agg(t) FROM (
      SELECT lvl AS level,
             tries,
             clears,
             CASE WHEN tries > 0 THEN round(100.0 * clears / tries, 1) ELSE 0 END AS rate
      FROM public.br_rate
      WHERE tries > 0
      ORDER BY (CASE WHEN tries > 0 THEN 100.0 * clears / tries ELSE 0 END) DESC,
               tries DESC
    ) t),
    '[]'::json
  );
$$;

-- ---------- 授权给 anon（PublishableKey 用的就是它）----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA public TO anon';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE ON public.br_rate TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_rate_put(text, boolean) TO anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.br_rate_get() TO anon';
  END IF;
END $$;
