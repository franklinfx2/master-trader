-- Fix trading performance data security issue
-- Since trades_stats is a view that aggregates data from trades table,
-- and the trades table already has RLS policies that restrict access to user's own trades,
-- the view should automatically inherit this security.
-- 
-- However, to be extra secure, let's create a security definer function
-- that users can call to get their own stats, and then update the view to use it.

-- First, drop the existing view
DROP VIEW IF EXISTS public.trades_stats;

-- Create a security definer function to get current user's trade stats
CREATE OR REPLACE FUNCTION public.get_user_trade_stats(target_user_id uuid DEFAULT NULL)
RETURNS TABLE (
    user_id uuid,
    trade_count bigint,
    avg_rr numeric,
    win_rate numeric,
    total_pnl numeric
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT t.user_id,
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
    AND (target_user_id IS NULL OR t.user_id = target_user_id)
    AND t.user_id = auth.uid()  -- Critical: Only return stats for authenticated user
    GROUP BY t.user_id;
$$;

-- Recreate the view to call the security definer function
CREATE VIEW public.trades_stats AS
SELECT * FROM public.get_user_trade_stats();

-- Grant appropriate permissions
GRANT SELECT ON public.trades_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_trade_stats(uuid) TO authenticated;