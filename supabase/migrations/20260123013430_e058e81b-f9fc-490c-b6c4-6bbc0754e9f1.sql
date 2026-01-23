-- Step 1: Drop the dependent view
DROP VIEW IF EXISTS trades_v2_elite_stats;

-- Step 2: Add a temporary text column
ALTER TABLE trades_v2_elite ADD COLUMN setup_type_text TEXT;

-- Step 3: Copy data from enum column to text column
UPDATE trades_v2_elite SET setup_type_text = setup_type::TEXT;

-- Step 4: Drop the enum column
ALTER TABLE trades_v2_elite DROP COLUMN setup_type;

-- Step 5: Rename the text column to setup_type
ALTER TABLE trades_v2_elite RENAME COLUMN setup_type_text TO setup_type;

-- Step 6: Set NOT NULL constraint (matches original behavior)
ALTER TABLE trades_v2_elite ALTER COLUMN setup_type SET NOT NULL;

-- Step 7: Set default value
ALTER TABLE trades_v2_elite ALTER COLUMN setup_type SET DEFAULT 'OBC';

-- Step 8: Recreate the view (without hardcoded setup_type enum references - those stats are legacy and computed dynamically in the app now)
CREATE OR REPLACE VIEW trades_v2_elite_stats AS
SELECT 
    user_id,
    count(*) AS trade_count,
    count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND result = 'Win'::trade_result_enum) AS wins,
    count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND result = 'Loss'::trade_result_enum) AS losses,
    count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND result = 'BE'::trade_result_enum) AS breakeven,
    round(avg(r_multiple) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND r_multiple IS NOT NULL), 2) AS avg_r_multiple,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS win_rate,
    sum(r_multiple) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND r_multiple IS NOT NULL) AS total_r,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND session = 'Asia'::session_enum AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND session = 'Asia'::session_enum AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS asia_win_rate,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND session = 'London'::session_enum AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND session = 'London'::session_enum AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS london_win_rate,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND session = 'NY'::session_enum AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND session = 'NY'::session_enum AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS ny_win_rate,
    -- Legacy setup type stats (kept for backwards compatibility, now uses TEXT comparison)
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND setup_type = 'OBC' AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND setup_type = 'OBC' AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS obc_win_rate,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND setup_type = 'OBR' AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND setup_type = 'OBR' AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS obr_win_rate,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND setup_type = 'BB' AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND setup_type = 'BB' AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS bb_win_rate,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND news_day = 'Yes'::yes_no_enum AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND news_day = 'Yes'::yes_no_enum AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS news_day_win_rate,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND news_day = 'No'::yes_no_enum AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND news_day = 'No'::yes_no_enum AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS non_news_day_win_rate,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND rules_followed = 'Yes'::yes_no_enum AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND rules_followed = 'Yes'::yes_no_enum AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS rules_followed_win_rate,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND rules_followed = 'No'::yes_no_enum AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND rules_followed = 'No'::yes_no_enum AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS rules_broken_win_rate,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND liquidity_taken_before_entry = 'Yes'::yes_no_enum AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND liquidity_taken_before_entry = 'Yes'::yes_no_enum AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS liquidity_taken_win_rate,
    round(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND liquidity_taken_before_entry = 'No'::yes_no_enum AND result = 'Win'::trade_result_enum)::numeric / NULLIF(count(*) FILTER (WHERE trade_status = 'Executed'::trade_status_enum AND liquidity_taken_before_entry = 'No'::yes_no_enum AND (result = ANY (ARRAY['Win'::trade_result_enum, 'Loss'::trade_result_enum]))), 0)::numeric * 100::numeric, 1) AS no_liquidity_win_rate
FROM trades_v2_elite
GROUP BY user_id;