-- Fix the existing trades_stats view to use SECURITY INVOKER
DROP VIEW IF EXISTS public.trades_stats;

CREATE VIEW public.trades_stats 
WITH (security_invoker = true)
AS
SELECT 
  t.user_id,
  count(*) AS trade_count,
  avg(NULLIF(t.rr, 0::numeric)) AS avg_rr,
  avg(
    CASE
      WHEN t.result = 'win'::text THEN 1
      WHEN t.result = 'loss'::text THEN 0
      ELSE NULL::integer
    END) * 100::numeric AS win_rate,
  sum(COALESCE(t.pnl, 0::numeric)) AS total_pnl
FROM trades t
WHERE t.result = ANY (ARRAY['win'::text, 'loss'::text])
GROUP BY t.user_id;