-- Drop the existing trades_stats view
DROP VIEW IF EXISTS public.trades_stats;

-- Recreate the view without SECURITY DEFINER (defaults to SECURITY INVOKER)
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

-- Enable RLS on the trades_stats view
ALTER VIEW public.trades_stats SET (security_barrier = true);

-- Create RLS policy for trades_stats view
CREATE POLICY "Users can view own trade stats" 
ON public.trades_stats 
FOR SELECT 
USING (auth.uid() = user_id);