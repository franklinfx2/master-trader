// XAUUSD ELITE TRADING JOURNAL — TYPE DEFINITIONS
// DO NOT MODIFY: Implements exact spec as provided

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
export type HTFTimeframe = 'H4' | 'H1';
export type MarketPhase = 'Expansion' | 'Retracement' | 'Consolidation';
export type StructureState = 'HH-HL' | 'LH-LL' | 'CHoCH' | 'BOS';

// Liquidity targets (multi-select)
export type LiquidityTarget = 
  | 'Asian High'
  | 'Asian Low'
  | 'Previous Day High (PDH)'
  | 'Previous Day Low (PDL)'
  | 'Equal Highs'
  | 'Equal Lows';

// Setup Classification
export type SetupType = 'OBC' | 'OBR' | 'BB';
export type SetupGrade = 'A+' | 'A' | 'B' | 'Trash';
export type ExecutionTF = 'M1' | 'M3' | 'M5';

// Entry Mechanics
export type EntryModel = 
  | 'OB retest'
  | 'Sweep → Displacement → OB'
  | 'BOS pullback';

export type EntryCandle = 
  | 'Engulfing'
  | 'Displacement'
  | 'Rejection'
  | 'Break & Retest';

// Execution Discipline
export type EntryPrecision = 'Early' | 'Optimal' | 'Late';
export type StopPlacementQuality = 'Clean' | 'Wide' | 'Tight';

// Gold Behavior Tags (multi-select)
export type GoldBehaviorTag = 
  | 'Trap move before real move'
  | 'Fake breakout'
  | 'News exaggeration'
  | 'Range expansion NY'
  | 'London manipulation'
  | 'Clean continuation'
  | 'Violent rejection';

// Psychology
export type PreTradeState = 'Calm' | 'FOMO' | 'Hesitant' | 'Overconfident';

// Trade Result (auto-calculated)
export type TradeResult = 'Win' | 'Loss' | 'BE';

// Classification Status
export type ClassificationStatus = 
  | 'legacy_unclassified'
  | 'partially_classified'
  | 'fully_classified';

// Main Elite Trade interface
export interface EliteTrade {
  // Trade Identity
  id: string;
  user_id: string;
  trade_date: string;
  instrument: string; // Fixed: XAUUSD
  account_type: AccountType;
  
  // Session & Time
  session: Session;
  killzone: Killzone;
  day_of_week: DayOfWeek;
  news_day: YesNo;
  
  // Higher-Timeframe Context
  htf_bias: HTFBias;
  htf_timeframe: HTFTimeframe;
  market_phase: MarketPhase;
  structure_state: StructureState;
  
  // Liquidity (multi-select)
  liquidity_targeted: LiquidityTarget[];
  liquidity_taken_before_entry: YesNo;
  liquidity_taken_against_bias: YesNo;
  
  // Setup Classification
  setup_type: SetupType;
  setup_grade: SetupGrade;
  execution_tf: ExecutionTF;
  
  // Entry Mechanics
  entry_model: EntryModel;
  entry_candle: EntryCandle;
  confirmation_present: YesNo;
  
  // Price Levels
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  exit_price?: number;
  
  // Risk & Execution
  risk_per_trade_pct: number;
  rr_planned: number;
  rr_realized?: number;
  
  // Execution Discipline
  entry_precision: EntryPrecision;
  stop_placement_quality: StopPlacementQuality;
  partial_taken: YesNo;
  rules_followed: YesNo;
  
  // Performance Metrics (AUTO-CALCULATED)
  result?: TradeResult;
  r_multiple?: number;
  mae?: number;
  mfe?: number;
  drawdown_during_trade_pct?: number;
  
  // Gold Behavior Tags (multi-select)
  gold_behavior_tags: GoldBehaviorTag[];
  
  // Sequence Logic
  first_move_was_fake: YesNo;
  real_move_after_liquidity: YesNo;
  trade_aligned_with_real_move: YesNo;
  
  // Psychology
  pre_trade_state: PreTradeState;
  confidence_level: number; // 1-5
  revenge_trade: YesNo;
  fatigue_present: YesNo;
  
  // Visual Evidence
  htf_screenshot?: string;
  ltf_entry_screenshot?: string;
  post_trade_screenshot?: string;
  annotations_present?: YesNo;
  screenshots_valid: boolean;
  
  // Classification Status
  classification_status: ClassificationStatus;
  legacy_trade_id?: string;
  
  // Final Intelligence Field
  would_i_take_this_trade_again?: YesNo;
  
  // Notes
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
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
  
  // Setup breakdown
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

// Form data for creating/updating elite trades
export interface EliteTradeFormData {
  trade_date: string;
  account_type: AccountType;
  session: Session;
  killzone: Killzone;
  day_of_week: DayOfWeek;
  news_day: YesNo;
  htf_bias: HTFBias;
  htf_timeframe: HTFTimeframe;
  market_phase: MarketPhase;
  structure_state: StructureState;
  liquidity_targeted: LiquidityTarget[];
  liquidity_taken_before_entry: YesNo;
  liquidity_taken_against_bias: YesNo;
  setup_type: SetupType;
  setup_grade: SetupGrade;
  execution_tf: ExecutionTF;
  entry_model: EntryModel;
  entry_candle: EntryCandle;
  confirmation_present: YesNo;
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  exit_price: string;
  risk_per_trade_pct: string;
  rr_planned: string;
  entry_precision: EntryPrecision;
  stop_placement_quality: StopPlacementQuality;
  partial_taken: YesNo;
  rules_followed: YesNo;
  gold_behavior_tags: GoldBehaviorTag[];
  first_move_was_fake: YesNo;
  real_move_after_liquidity: YesNo;
  trade_aligned_with_real_move: YesNo;
  pre_trade_state: PreTradeState;
  confidence_level: number;
  revenge_trade: YesNo;
  fatigue_present: YesNo;
  htf_screenshot: string;
  ltf_entry_screenshot: string;
  post_trade_screenshot: string;
  annotations_present: YesNo;
  would_i_take_this_trade_again?: YesNo;
  mae: string;
  mfe: string;
  notes: string;
}

// Options for dropdowns
export const ACCOUNT_TYPES: AccountType[] = ['Demo', 'Live', 'Funded'];
export const SESSIONS: Session[] = ['Asia', 'London', 'NY'];
export const KILLZONES: Killzone[] = ['LO', 'NYO', 'NYPM', 'None'];
export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const HTF_BIASES: HTFBias[] = ['Bullish', 'Bearish', 'Range'];
export const HTF_TIMEFRAMES: HTFTimeframe[] = ['H4', 'H1'];
export const MARKET_PHASES: MarketPhase[] = ['Expansion', 'Retracement', 'Consolidation'];
export const STRUCTURE_STATES: StructureState[] = ['HH-HL', 'LH-LL', 'CHoCH', 'BOS'];
export const LIQUIDITY_TARGETS: LiquidityTarget[] = [
  'Asian High',
  'Asian Low',
  'Previous Day High (PDH)',
  'Previous Day Low (PDL)',
  'Equal Highs',
  'Equal Lows'
];
export const SETUP_TYPES: SetupType[] = ['OBC', 'OBR', 'BB'];
export const SETUP_GRADES: SetupGrade[] = ['A+', 'A', 'B', 'Trash'];
export const EXECUTION_TFS: ExecutionTF[] = ['M1', 'M3', 'M5'];
export const ENTRY_MODELS: EntryModel[] = ['OB retest', 'Sweep → Displacement → OB', 'BOS pullback'];
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
export const YES_NO: YesNo[] = ['Yes', 'No'];
