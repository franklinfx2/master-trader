-- Fix trades_v2_elite_stats view to exclude missed trades from performance metrics
-- Missed trades should NEVER affect wins/losses/win rate/R calculations

DROP VIEW IF EXISTS trades_v2_elite_stats;

CREATE VIEW trades_v2_elite_stats AS
SELECT 
    user_id,
    -- Total count includes all trades for context
    count(*) AS trade_count,
    -- Performance metrics only count EXECUTED trades
    count(*) FILTER (WHERE trade_status = 'Executed' AND result = 'Win') AS wins,
    count(*) FILTER (WHERE trade_status = 'Executed' AND result = 'Loss') AS losses,
    count(*) FILTER (WHERE trade_status = 'Executed' AND result = 'BE') AS breakeven,
    round(avg(r_multiple) FILTER (WHERE trade_status = 'Executed' AND r_multiple IS NOT NULL), 2) AS avg_r_multiple,
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS win_rate,
    sum(r_multiple) FILTER (WHERE trade_status = 'Executed' AND r_multiple IS NOT NULL) AS total_r,
    
    -- Session win rates (executed only)
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND session = 'Asia' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND session = 'Asia' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS asia_win_rate,
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND session = 'London' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND session = 'London' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS london_win_rate,
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND session = 'NY' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND session = 'NY' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS ny_win_rate,
    
    -- Setup type win rates (executed only)
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND setup_type = 'OBC' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND setup_type = 'OBC' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS obc_win_rate,
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND setup_type = 'OBR' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND setup_type = 'OBR' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS obr_win_rate,
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND setup_type = 'BB' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND setup_type = 'BB' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS bb_win_rate,
    
    -- News day win rates (executed only)
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND news_day = 'Yes' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND news_day = 'Yes' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS news_day_win_rate,
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND news_day = 'No' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND news_day = 'No' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS non_news_day_win_rate,
    
    -- Rules followed win rates (executed only)
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND rules_followed = 'Yes' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND rules_followed = 'Yes' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS rules_followed_win_rate,
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND rules_followed = 'No' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND rules_followed = 'No' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS rules_broken_win_rate,
    
    -- Liquidity win rates (executed only)
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND liquidity_taken_before_entry = 'Yes' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND liquidity_taken_before_entry = 'Yes' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS liquidity_taken_win_rate,
    round(
        count(*) FILTER (WHERE trade_status = 'Executed' AND liquidity_taken_before_entry = 'No' AND result = 'Win')::numeric / 
        NULLIF(count(*) FILTER (WHERE trade_status = 'Executed' AND liquidity_taken_before_entry = 'No' AND result IN ('Win', 'Loss')), 0)::numeric * 100, 1
    ) AS no_liquidity_win_rate
FROM trades_v2_elite
GROUP BY user_id;