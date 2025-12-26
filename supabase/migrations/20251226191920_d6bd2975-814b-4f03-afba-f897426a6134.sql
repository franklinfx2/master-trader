-- Fix SECURITY DEFINER view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.trades_v2_elite_stats;

CREATE VIEW public.trades_v2_elite_stats 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  COUNT(*) AS trade_count,
  COUNT(*) FILTER (WHERE result = 'Win') AS wins,
  COUNT(*) FILTER (WHERE result = 'Loss') AS losses,
  COUNT(*) FILTER (WHERE result = 'BE') AS breakeven,
  ROUND(AVG(r_multiple) FILTER (WHERE r_multiple IS NOT NULL), 2) AS avg_r_multiple,
  ROUND((COUNT(*) FILTER (WHERE result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE result IN ('Win', 'Loss')), 0)) * 100, 1) AS win_rate,
  SUM(r_multiple) FILTER (WHERE r_multiple IS NOT NULL) AS total_r,
  
  -- Session breakdown
  ROUND((COUNT(*) FILTER (WHERE session = 'Asia' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE session = 'Asia' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS asia_win_rate,
  ROUND((COUNT(*) FILTER (WHERE session = 'London' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE session = 'London' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS london_win_rate,
  ROUND((COUNT(*) FILTER (WHERE session = 'NY' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE session = 'NY' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS ny_win_rate,
  
  -- Setup breakdown
  ROUND((COUNT(*) FILTER (WHERE setup_type = 'OBC' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE setup_type = 'OBC' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS obc_win_rate,
  ROUND((COUNT(*) FILTER (WHERE setup_type = 'OBR' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE setup_type = 'OBR' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS obr_win_rate,
  ROUND((COUNT(*) FILTER (WHERE setup_type = 'BB' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE setup_type = 'BB' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS bb_win_rate,
  
  -- News vs Non-news
  ROUND((COUNT(*) FILTER (WHERE news_day = 'Yes' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE news_day = 'Yes' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS news_day_win_rate,
  ROUND((COUNT(*) FILTER (WHERE news_day = 'No' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE news_day = 'No' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS non_news_day_win_rate,
  
  -- Rules followed vs broken
  ROUND((COUNT(*) FILTER (WHERE rules_followed = 'Yes' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE rules_followed = 'Yes' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS rules_followed_win_rate,
  ROUND((COUNT(*) FILTER (WHERE rules_followed = 'No' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE rules_followed = 'No' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS rules_broken_win_rate,
  
  -- Liquidity analysis
  ROUND((COUNT(*) FILTER (WHERE liquidity_taken_before_entry = 'Yes' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE liquidity_taken_before_entry = 'Yes' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS liquidity_taken_win_rate,
  ROUND((COUNT(*) FILTER (WHERE liquidity_taken_before_entry = 'No' AND result = 'Win')::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE liquidity_taken_before_entry = 'No' AND result IN ('Win', 'Loss')), 0)) * 100, 1) AS no_liquidity_win_rate
  
FROM public.trades_v2_elite
WHERE classification_status = 'fully_classified'
GROUP BY user_id;