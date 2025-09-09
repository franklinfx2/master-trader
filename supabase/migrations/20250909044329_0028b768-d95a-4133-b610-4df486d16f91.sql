-- Drop the existing trades_stats view if it exists
DROP VIEW IF EXISTS public.trades_stats;

-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default)
-- This means the view will use the permissions of the querying user, not the view creator
CREATE VIEW public.trades_stats AS
SELECT 
    user_id,
    count(*) AS trade_count,
    avg(NULLIF(rr, 0::numeric)) AS avg_rr,
    (avg(
        CASE
            WHEN result = 'win' THEN 1
            WHEN result = 'loss' THEN 0
            ELSE NULL::integer
        END) * 100::numeric) AS win_rate,
    sum(COALESCE(pnl, 0::numeric)) AS total_pnl
FROM trades t
WHERE result = ANY (ARRAY['win'::text, 'loss'::text])
GROUP BY user_id;