// ELITE BACKTESTING ENGINE — TYPE DEFINITIONS
// Universal backtesting for any instrument (Forex, Indices, Crypto, Metals)
// Fast data capture, objective fields, no psychology

// Yes/No enum
export type YesNo = 'Yes' | 'No';

// Account type
export type AccountType = 'Demo' | 'Live' | 'Funded';

// Session & Killzone
export type Session = 'Asia' | 'London' | 'NY';
export type Killzone = 'LO' | 'NYO' | 'NYPM' | 'None';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

// HTF Context
export type HTFBias = 'Bullish' | 'Bearish' | 'Range';
export type HTFTimeframe = 'H4' | 'H1' | 'D1' | 'W1';
export type PricePosition = 'At Level' | 'Open';
export type StructureState = 'Continuation' | 'Reversal' | 'Range' | 'HH-HL' | 'LH-LL' | 'CHoCH' | 'BOS';

// Liquidity targets (generic, multi-select)
export type LiquidityTarget = 
  | 'Session High'
  | 'Session Low'
  | 'Previous Day High'
  | 'Previous Day Low'
  | 'Equal Highs'
  | 'Equal Lows'
  | 'Structural Liquidity'
  | 'Imbalance'
  // Legacy values for backwards compatibility
  | 'Asian High'
  | 'Asian Low'
  | 'Previous Day High (PDH)'
  | 'Previous Day Low (PDL)'
  | 'Displacement';

// Setup Classification - Now supports user-defined values
export type SetupType = string; // User-defined, normalized
export type SetupGrade = 'A+' | 'A' | 'B' | 'Trash';
export type ExecutionTF = 'M1' | 'M3' | 'M5' | 'M15' | 'M30' | 'H1';

// Entry Model (DB enum values)
// NOTE: Must match Supabase enum entry_model_enum exactly.
export type EntryModel =
  | 'OB retest'
  | 'Sweep → Displacement → OB'
  | 'BOS pullback';

// Trade Result (auto-calculated)
export type TradeResult = 'Win' | 'Loss' | 'BE';

// Classification Status
export type ClassificationStatus = 
  | 'legacy_unclassified'
  | 'partially_classified'
  | 'fully_classified';

// Trade Status (Executed vs Missed)
export type TradeStatus = 'Executed' | 'Missed';
export type MissedReason = 'Hesitation' | 'Away' | 'Technical' | 'Fear' | 'Other';
export type HypotheticalResult = 'Win' | 'Loss' | 'BE' | 'Unknown';

// ===== DEPRECATED TYPES (kept for backwards compatibility) =====
export type MarketPhase = 'Expansion' | 'Retracement' | 'Consolidation';
export type EntryCandle = 'Engulfing' | 'Displacement' | 'Rejection' | 'Break & Retest';
export type EntryPrecision = 'Early' | 'Optimal' | 'Late';
export type StopPlacementQuality = 'Clean' | 'Wide' | 'Tight';
export type GoldBehaviorTag = 
  | 'Trap move before real move'
  | 'Fake breakout'
  | 'News exaggeration'
  | 'Range expansion NY'
  | 'London manipulation'
  | 'Clean continuation'
  | 'Violent rejection';
export type NewsImpact = 'LOW' | 'MEDIUM' | 'HIGH';
export type NewsTiming = 'PRE_NEWS' | 'AT_RELEASE' | 'POST_NEWS';
export type NewsType = 'INFLATION' | 'RATES' | 'EMPLOYMENT' | 'RISK_SENTIMENT' | 'NONE';
export type PreTradeState = 'Calm' | 'FOMO' | 'Hesitant' | 'Overconfident';

// Setup Type Registry (for canonical setup management)
export interface SetupTypeRecord {
  id: string;
  user_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Main Elite Trade interface
export interface EliteTrade {
  // Trade Identity
  id: string;
  user_id: string;
  trade_date: string;
  trade_time?: string;
  instrument: string; // Flexible: any symbol
  account_type: AccountType;
  
  // Trade Status (Executed vs Missed)
  trade_status: TradeStatus;
  missed_reason?: MissedReason;
  hypothetical_result?: HypotheticalResult;
  
  // Session & Time
  session: Session;
  killzone?: Killzone;
  day_of_week: DayOfWeek;
  news_day: YesNo;
  
  // Higher-Timeframe Context (Objective)
  htf_bias: HTFBias;
  htf_timeframe: HTFTimeframe;
  structure_state: StructureState;
  is_htf_clear?: YesNo;
  price_at_level_or_open?: PricePosition;
  
  // Liquidity (Generic)
  liquidity_targeted: LiquidityTarget[];
  liquidity_taken_before_entry: YesNo;
  
  // Setup Definition (User-defined setup type via registry)
  setup_type_id?: string; // Foreign key to setup_types table (preferred)
  setup_type: SetupType; // String code for backward compat and display
  setup_grade: SetupGrade;
  execution_tf: ExecutionTF;
  entry_model: EntryModel;
  confirmation_present: YesNo;
  
  // Price Levels & Risk
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  exit_price?: number;
  risk_per_trade_pct: number;
  rr_planned: number;
  rr_realized?: number;
  
  // Performance Metrics (AUTO-CALCULATED)
  result?: TradeResult;
  r_multiple?: number;
  mae?: number;
  mfe?: number;
  
  // Rules Integrity
  rules_followed: YesNo;
  
  // Visual Evidence (Optional, non-blocking)
  htf_screenshot?: string;
  ltf_entry_screenshot?: string;
  ltf_trade_screenshot?: string;
  post_trade_screenshot?: string;
  screenshots_valid: boolean;
  
  // Classification Status
  classification_status: ClassificationStatus;
  legacy_trade_id?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // ===== DEPRECATED FIELDS (kept for backwards compatibility, hidden in UI) =====
  market_phase?: MarketPhase;
  liquidity_taken_against_bias?: YesNo;
  entry_candle?: EntryCandle;
  entry_precision?: EntryPrecision;
  stop_placement_quality?: StopPlacementQuality;
  partial_taken?: YesNo;
  drawdown_during_trade_pct?: number;
  gold_behavior_tags?: GoldBehaviorTag[];
  first_move_was_fake?: YesNo;
  real_move_after_liquidity?: YesNo;
  trade_aligned_with_real_move?: YesNo;
  pre_trade_state?: PreTradeState;
  confidence_level?: number;
  revenge_trade?: YesNo;
  fatigue_present?: YesNo;
  annotations_present?: YesNo;
  would_i_take_this_trade_again?: YesNo;
  notes?: string;
  news_impact?: NewsImpact;
  news_timing?: NewsTiming;
  news_type?: NewsType;
}

// Elite Trade Stats interface
export interface EliteTradeStats {
  user_id: string;
  trade_count: number;
  wins: number;
  losses: number;
  breakeven: number;
  avg_r_multiple: number;
  win_rate: number;
  total_r: number;
  
  // Session breakdown
  asia_win_rate: number;
  london_win_rate: number;
  ny_win_rate: number;
  
  // Setup breakdown (kept for analytics)
  obc_win_rate: number;
  obr_win_rate: number;
  bb_win_rate: number;
  
  // News vs Non-news
  news_day_win_rate: number;
  non_news_day_win_rate: number;
  
  // Rules followed vs broken
  rules_followed_win_rate: number;
  rules_broken_win_rate: number;
  
  // Liquidity analysis
  liquidity_taken_win_rate: number;
  no_liquidity_win_rate: number;
}

// Form data for creating/updating elite trades (Backtesting Engine)
export interface EliteTradeFormData {
  // Core Trade Context
  trade_date: string;
  trade_time?: string;
  instrument: string;
  account_type: AccountType;
  trade_status?: TradeStatus;
  missed_reason?: MissedReason;
  hypothetical_result?: HypotheticalResult;
  
  // Session & Time
  session: Session;
  killzone?: Killzone;
  day_of_week: DayOfWeek;
  news_day: YesNo;
  
  // HTF Context (Objective)
  htf_bias: HTFBias;
  htf_timeframe: HTFTimeframe;
  structure_state: StructureState;
  is_htf_clear?: YesNo;
  price_at_level_or_open?: PricePosition;
  
  // Liquidity (Generic)
  liquidity_targeted: LiquidityTarget[];
  liquidity_taken_before_entry: YesNo;
  
  // Setup Definition (via registry)
  setup_type_id?: string; // Foreign key to setup_types table (preferred)
  setup_type: string; // String code for backward compat
  setup_grade: SetupGrade;
  execution_tf: ExecutionTF;
  entry_model: EntryModel;
  confirmation_present: YesNo;
  
  // Price Levels & Risk
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  exit_price?: string;
  risk_per_trade_pct: string;
  rr_planned: string;
  
  // Metrics
  mae?: string;
  mfe?: string;
  
  // Rules Integrity
  rules_followed: YesNo;
  
  // Visual Evidence (All optional, non-blocking)
  htf_screenshot?: string;
  ltf_entry_screenshot?: string;
  ltf_trade_screenshot?: string;
  post_trade_screenshot?: string;
  
  // ===== DEPRECATED FIELDS (optional, for backwards compatibility) =====
  market_phase?: MarketPhase;
  liquidity_taken_against_bias?: YesNo;
  entry_candle?: EntryCandle;
  entry_precision?: EntryPrecision;
  stop_placement_quality?: StopPlacementQuality;
  partial_taken?: YesNo;
  gold_behavior_tags?: GoldBehaviorTag[];
  first_move_was_fake?: YesNo;
  real_move_after_liquidity?: YesNo;
  trade_aligned_with_real_move?: YesNo;
  pre_trade_state?: PreTradeState;
  confidence_level?: number;
  revenge_trade?: YesNo;
  fatigue_present?: YesNo;
  annotations_present?: YesNo;
  would_i_take_this_trade_again?: YesNo;
  notes?: string;
  news_impact?: NewsImpact;
  news_timing?: NewsTiming;
  news_type?: NewsType;
}

// ===== OPTIONS FOR DROPDOWNS =====

export const ACCOUNT_TYPES: AccountType[] = ['Demo', 'Live', 'Funded'];
export const SESSIONS: Session[] = ['Asia', 'London', 'NY'];
export const KILLZONES: Killzone[] = ['LO', 'NYO', 'NYPM', 'None'];
export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const HTF_BIASES: HTFBias[] = ['Bullish', 'Bearish', 'Range'];
export const HTF_TIMEFRAMES: HTFTimeframe[] = ['H4', 'H1', 'D1', 'W1'];
export const STRUCTURE_STATES: StructureState[] = ['Continuation', 'Reversal', 'Range', 'HH-HL', 'LH-LL', 'CHoCH', 'BOS'];
export const PRICE_POSITIONS: PricePosition[] = ['At Level', 'Open'];

// Generic liquidity targets (instrument-neutral)
export const LIQUIDITY_TARGETS: LiquidityTarget[] = [
  'Session High',
  'Session Low',
  'Previous Day High',
  'Previous Day Low',
  'Equal Highs',
  'Equal Lows',
  'Structural Liquidity',
  'Imbalance'
];

// Common setup types (user can add custom)
export const COMMON_SETUP_TYPES: string[] = [
  'OB', // Order Block
  'BB', // Breaker Block
  'FVG', // Fair Value Gap
  'BOS', // Break of Structure
  'CHoCH', // Change of Character
  'Sweep',
  'Custom'
];

export const SETUP_GRADES: SetupGrade[] = ['A+', 'A', 'B', 'Trash'];
export const EXECUTION_TFS: ExecutionTF[] = ['M1', 'M3', 'M5', 'M15', 'M30', 'H1'];

// Entry models (DB enum values)
export const ENTRY_MODELS: EntryModel[] = [
  'OB retest',
  'Sweep → Displacement → OB',
  'BOS pullback',
];

export const YES_NO: YesNo[] = ['Yes', 'No'];

// Trade Status Options
export const TRADE_STATUSES: TradeStatus[] = ['Executed', 'Missed'];
export const MISSED_REASONS: MissedReason[] = ['Hesitation', 'Away', 'Technical', 'Fear', 'Other'];
export const HYPOTHETICAL_RESULTS: HypotheticalResult[] = ['Win', 'Loss', 'BE', 'Unknown'];

// ===== DEPRECATED OPTIONS (kept for backwards compatibility) =====
export const SETUP_TYPES: string[] = ['OBC', 'OBR', 'BB']; // Legacy
export const MARKET_PHASES: MarketPhase[] = ['Expansion', 'Retracement', 'Consolidation'];
export const ENTRY_CANDLES: EntryCandle[] = ['Engulfing', 'Displacement', 'Rejection', 'Break & Retest'];
export const ENTRY_PRECISIONS: EntryPrecision[] = ['Early', 'Optimal', 'Late'];
export const STOP_PLACEMENT_QUALITIES: StopPlacementQuality[] = ['Clean', 'Wide', 'Tight'];
export const GOLD_BEHAVIOR_TAGS: GoldBehaviorTag[] = [
  'Trap move before real move',
  'Fake breakout',
  'News exaggeration',
  'Range expansion NY',
  'London manipulation',
  'Clean continuation',
  'Violent rejection'
];
export const PRE_TRADE_STATES: PreTradeState[] = ['Calm', 'FOMO', 'Hesitant', 'Overconfident'];
export const NEWS_IMPACTS: NewsImpact[] = ['LOW', 'MEDIUM', 'HIGH'];
export const NEWS_TIMINGS: NewsTiming[] = ['PRE_NEWS', 'AT_RELEASE', 'POST_NEWS'];
export const NEWS_TYPES: NewsType[] = ['INFLATION', 'RATES', 'EMPLOYMENT', 'RISK_SENTIMENT', 'NONE'];
