-- Fix security definer view issue by recreating trades_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS public.trades_stats;

-- Recreate the view without SECURITY DEFINER (which is the default and safer)
-- The view will inherit security from the underlying trades table RLS policies
CREATE VIEW public.trades_stats AS
SELECT 
    user_id,
    count(*) AS trade_count,
    avg(NULLIF(rr, 0::numeric)) AS avg_rr,
    (avg(
        CASE
            WHEN result = 'win'::text THEN 1
            WHEN result = 'loss'::text THEN 0
            ELSE NULL::integer
        END
    ) * 100::numeric) AS win_rate,
    sum(COALESCE(pnl, 0::numeric)) AS total_pnl
FROM trades t
WHERE result = ANY (ARRAY['win'::text, 'loss'::text])
GROUP BY user_id;