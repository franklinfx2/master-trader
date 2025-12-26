-- XAUUSD ELITE TRADING JOURNAL — DATABASE SCHEMA
-- DO NOT MODIFY: Implements exact spec as provided

-- =====================================================
-- ENUM TYPES (Fixed values, no free-text)
-- =====================================================

-- Account type
CREATE TYPE account_type_enum AS ENUM ('Demo', 'Live', 'Funded');

-- Session & Killzone
CREATE TYPE session_enum AS ENUM ('Asia', 'London', 'NY');
CREATE TYPE killzone_enum AS ENUM ('LO', 'NYO', 'NYPM', 'None');
CREATE TYPE day_of_week_enum AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');

-- HTF Context
CREATE TYPE htf_bias_enum AS ENUM ('Bullish', 'Bearish', 'Range');
CREATE TYPE htf_timeframe_enum AS ENUM ('H4', 'H1');
CREATE TYPE market_phase_enum AS ENUM ('Expansion', 'Retracement', 'Consolidation');
CREATE TYPE structure_state_enum AS ENUM ('HH-HL', 'LH-LL', 'CHoCH', 'BOS');

-- Liquidity targets (for multi-select array)
CREATE TYPE liquidity_target_enum AS ENUM (
  'Asian High',
  'Asian Low', 
  'Previous Day High (PDH)',
  'Previous Day Low (PDL)',
  'Equal Highs',
  'Equal Lows'
);

-- Setup Classification
CREATE TYPE setup_type_enum AS ENUM ('OBC', 'OBR', 'BB');
CREATE TYPE setup_grade_enum AS ENUM ('A+', 'A', 'B', 'Trash');
CREATE TYPE execution_tf_enum AS ENUM ('M1', 'M3', 'M5');

-- Entry Mechanics
CREATE TYPE entry_model_enum AS ENUM (
  'OB retest',
  'Sweep → Displacement → OB',
  'BOS pullback'
);
CREATE TYPE entry_candle_enum AS ENUM (
  'Engulfing',
  'Displacement',
  'Rejection',
  'Break & Retest'
);

-- Execution Discipline
CREATE TYPE entry_precision_enum AS ENUM ('Early', 'Optimal', 'Late');
CREATE TYPE stop_placement_quality_enum AS ENUM ('Clean', 'Wide', 'Tight');

-- Gold Behavior Tags (for multi-select array)
CREATE TYPE gold_behavior_tag_enum AS ENUM (
  'Trap move before real move',
  'Fake breakout',
  'News exaggeration',
  'Range expansion NY',
  'London manipulation',
  'Clean continuation',
  'Violent rejection'
);

-- Psychology
CREATE TYPE pre_trade_state_enum AS ENUM ('Calm', 'FOMO', 'Hesitant', 'Overconfident');

-- Trade Result (auto-calculated)
CREATE TYPE trade_result_enum AS ENUM ('Win', 'Loss', 'BE');

-- Classification Status
CREATE TYPE classification_status_enum AS ENUM (
  'legacy_unclassified',
  'partially_classified',
  'fully_classified'
);

-- Yes/No enum for consistency
CREATE TYPE yes_no_enum AS ENUM ('Yes', 'No');

-- =====================================================
-- TRADES_V2_ELITE TABLE
-- =====================================================

CREATE TABLE public.trades_v2_elite (
  -- Trade Identity
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trade_date DATE NOT NULL,
  instrument TEXT NOT NULL DEFAULT 'XAUUSD',
  account_type account_type_enum NOT NULL,
  
  -- Session & Time
  session session_enum NOT NULL,
  killzone killzone_enum NOT NULL,
  day_of_week day_of_week_enum NOT NULL,
  news_day yes_no_enum NOT NULL,
  
  -- Higher-Timeframe Context
  htf_bias htf_bias_enum NOT NULL,
  htf_timeframe htf_timeframe_enum NOT NULL,
  market_phase market_phase_enum NOT NULL,
  structure_state structure_state_enum NOT NULL,
  
  -- Liquidity (multi-select stored as arrays)
  liquidity_targeted liquidity_target_enum[] NOT NULL DEFAULT '{}',
  liquidity_taken_before_entry yes_no_enum NOT NULL,
  liquidity_taken_against_bias yes_no_enum NOT NULL,
  
  -- Setup Classification
  setup_type setup_type_enum NOT NULL,
  setup_grade setup_grade_enum NOT NULL,
  execution_tf execution_tf_enum NOT NULL,
  
  -- Entry Mechanics
  entry_model entry_model_enum NOT NULL,
  entry_candle entry_candle_enum NOT NULL,
  confirmation_present yes_no_enum NOT NULL,
  
  -- Price Levels (for calculations)
  entry_price NUMERIC NOT NULL,
  stop_loss NUMERIC NOT NULL,
  take_profit NUMERIC NOT NULL,
  exit_price NUMERIC,
  
  -- Risk & Execution
  risk_per_trade_pct NUMERIC NOT NULL,
  rr_planned NUMERIC NOT NULL,
  rr_realized NUMERIC,
  
  -- Execution Discipline
  entry_precision entry_precision_enum NOT NULL,
  stop_placement_quality stop_placement_quality_enum NOT NULL,
  partial_taken yes_no_enum NOT NULL,
  rules_followed yes_no_enum NOT NULL,
  
  -- Performance Metrics (AUTO-CALCULATED, READ-ONLY)
  result trade_result_enum,
  r_multiple NUMERIC,
  mae NUMERIC, -- Max Adverse Excursion
  mfe NUMERIC, -- Max Favorable Excursion  
  drawdown_during_trade_pct NUMERIC,
  
  -- Gold Behavior Tags (multi-select)
  gold_behavior_tags gold_behavior_tag_enum[] NOT NULL DEFAULT '{}',
  
  -- Sequence Logic
  first_move_was_fake yes_no_enum NOT NULL,
  real_move_after_liquidity yes_no_enum NOT NULL,
  trade_aligned_with_real_move yes_no_enum NOT NULL,
  
  -- Psychology
  pre_trade_state pre_trade_state_enum NOT NULL,
  confidence_level INTEGER NOT NULL CHECK (confidence_level >= 1 AND confidence_level <= 5),
  revenge_trade yes_no_enum NOT NULL,
  fatigue_present yes_no_enum NOT NULL,
  
  -- Visual Evidence (URLs, mandatory for fully_classified)
  htf_screenshot TEXT,
  ltf_entry_screenshot TEXT,
  post_trade_screenshot TEXT,
  annotations_present yes_no_enum,
  
  -- Trade Validity
  screenshots_valid BOOLEAN NOT NULL DEFAULT false,
  
  -- Classification Status
  classification_status classification_status_enum NOT NULL DEFAULT 'fully_classified',
  
  -- Legacy Reference (for migrated trades)
  legacy_trade_id UUID,
  
  -- Final Intelligence Field
  would_i_take_this_trade_again yes_no_enum,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.trades_v2_elite ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own elite trades"
  ON public.trades_v2_elite
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR FILTER ENGINE
-- =====================================================

CREATE INDEX idx_elite_user_id ON public.trades_v2_elite(user_id);
CREATE INDEX idx_elite_session ON public.trades_v2_elite(session);
CREATE INDEX idx_elite_setup_type ON public.trades_v2_elite(setup_type);
CREATE INDEX idx_elite_result ON public.trades_v2_elite(result);
CREATE INDEX idx_elite_news_day ON public.trades_v2_elite(news_day);
CREATE INDEX idx_elite_rules_followed ON public.trades_v2_elite(rules_followed);
CREATE INDEX idx_elite_classification ON public.trades_v2_elite(classification_status);
CREATE INDEX idx_elite_would_take_again ON public.trades_v2_elite(would_i_take_this_trade_again);
CREATE INDEX idx_elite_trade_date ON public.trades_v2_elite(trade_date);
CREATE INDEX idx_elite_killzone ON public.trades_v2_elite(killzone);

-- GIN indexes for array fields (multi-select filtering)
CREATE INDEX idx_elite_liquidity_targeted ON public.trades_v2_elite USING GIN(liquidity_targeted);
CREATE INDEX idx_elite_gold_behavior_tags ON public.trades_v2_elite USING GIN(gold_behavior_tags);

-- =====================================================
-- AUTO-CALCULATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_elite_trade_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_direction INTEGER;
  v_risk_distance NUMERIC;
  v_profit_distance NUMERIC;
BEGIN
  -- Only calculate if exit_price is provided
  IF NEW.exit_price IS NOT NULL THEN
    -- Determine direction based on entry vs stop loss
    IF NEW.stop_loss < NEW.entry_price THEN
      v_direction := 1; -- Long
    ELSE
      v_direction := -1; -- Short
    END IF;
    
    -- Calculate risk distance (always positive)
    v_risk_distance := ABS(NEW.entry_price - NEW.stop_loss);
    
    -- Calculate profit/loss distance
    v_profit_distance := (NEW.exit_price - NEW.entry_price) * v_direction;
    
    -- Calculate R Multiple
    IF v_risk_distance > 0 THEN
      NEW.r_multiple := ROUND(v_profit_distance / v_risk_distance, 2);
    END IF;
    
    -- Calculate RR Realized
    NEW.rr_realized := NEW.r_multiple;
    
    -- Determine Result
    IF NEW.r_multiple > 0.1 THEN
      NEW.result := 'Win';
    ELSIF NEW.r_multiple < -0.1 THEN
      NEW.result := 'Loss';
    ELSE
      NEW.result := 'BE';
    END IF;
    
    -- Calculate drawdown during trade (simplified - percentage of risk used)
    IF v_risk_distance > 0 AND NEW.mae IS NOT NULL THEN
      NEW.drawdown_during_trade_pct := ROUND((NEW.mae / v_risk_distance) * NEW.risk_per_trade_pct, 2);
    END IF;
  END IF;
  
  -- Validate screenshots for classification
  IF NEW.htf_screenshot IS NOT NULL 
     AND NEW.ltf_entry_screenshot IS NOT NULL 
     AND NEW.post_trade_screenshot IS NOT NULL THEN
    NEW.screenshots_valid := true;
  ELSE
    NEW.screenshots_valid := false;
  END IF;
  
  -- Update classification based on completeness
  IF NEW.classification_status = 'legacy_unclassified' THEN
    -- Keep legacy status unless explicitly upgraded
    NULL;
  ELSIF NEW.screenshots_valid = true 
     AND NEW.would_i_take_this_trade_again IS NOT NULL
     AND NEW.exit_price IS NOT NULL THEN
    NEW.classification_status := 'fully_classified';
  ELSE
    NEW.classification_status := 'partially_classified';
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_calculate_elite_metrics
  BEFORE INSERT OR UPDATE ON public.trades_v2_elite
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_elite_trade_metrics();

-- =====================================================
-- ELITE TRADES STATS VIEW (ONLY FULLY CLASSIFIED)
-- =====================================================

CREATE OR REPLACE VIEW public.trades_v2_elite_stats AS
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

-- =====================================================
-- FUNCTION TO MIGRATE LEGACY TRADES
-- =====================================================

CREATE OR REPLACE FUNCTION public.migrate_legacy_trade(
  p_legacy_trade_id UUID,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_legacy RECORD;
  v_new_id UUID;
BEGIN
  -- Fetch legacy trade
  SELECT * INTO v_legacy FROM trades WHERE id = p_legacy_trade_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Legacy trade not found or access denied';
  END IF;
  
  -- Create elite trade with legacy data (unclassified)
  INSERT INTO trades_v2_elite (
    user_id,
    trade_date,
    entry_price,
    stop_loss,
    take_profit,
    exit_price,
    notes,
    legacy_trade_id,
    classification_status,
    -- Default required fields to be filled during upgrade
    account_type,
    session,
    killzone,
    day_of_week,
    news_day,
    htf_bias,
    htf_timeframe,
    market_phase,
    structure_state,
    liquidity_taken_before_entry,
    liquidity_taken_against_bias,
    setup_type,
    setup_grade,
    execution_tf,
    entry_model,
    entry_candle,
    confirmation_present,
    risk_per_trade_pct,
    rr_planned,
    entry_precision,
    stop_placement_quality,
    partial_taken,
    rules_followed,
    first_move_was_fake,
    real_move_after_liquidity,
    trade_aligned_with_real_move,
    pre_trade_state,
    confidence_level,
    revenge_trade,
    fatigue_present
  )
  VALUES (
    p_user_id,
    COALESCE(v_legacy.executed_at::DATE, CURRENT_DATE),
    v_legacy.entry,
    COALESCE(v_legacy.sl, v_legacy.entry - 10), -- Default if missing
    COALESCE(v_legacy.tp, v_legacy.entry + 20), -- Default if missing
    v_legacy.exit,
    v_legacy.notes,
    v_legacy.id,
    'legacy_unclassified',
    -- Defaults to be overwritten
    'Demo',
    'London',
    'None',
    'Monday',
    'No',
    'Range',
    'H4',
    'Consolidation',
    'BOS',
    'No',
    'No',
    'OBC',
    'B',
    'M5',
    'OB retest',
    'Engulfing',
    'No',
    COALESCE(v_legacy.risk_pct, 1),
    COALESCE(v_legacy.rr, 2),
    'Optimal',
    'Clean',
    'No',
    'Yes',
    'No',
    'No',
    'No',
    'Calm',
    3,
    'No',
    'No'
  )
  RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$;