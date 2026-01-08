-- Add enhanced tracking fields to trades table
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS session text DEFAULT 'London',
ADD COLUMN IF NOT EXISTS setup_type text,
ADD COLUMN IF NOT EXISTS htf_bias text DEFAULT 'Neutral',
ADD COLUMN IF NOT EXISTS rules_followed text DEFAULT 'Yes',
ADD COLUMN IF NOT EXISTS confidence integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS trade_grade text DEFAULT 'B';

-- Add comments for documentation
COMMENT ON COLUMN public.trades.session IS 'Trading session: Asia, London, NY, London/NY Overlap';
COMMENT ON COLUMN public.trades.setup_type IS 'Setup type used for this trade';
COMMENT ON COLUMN public.trades.htf_bias IS 'Higher timeframe bias: Bullish, Bearish, Neutral';
COMMENT ON COLUMN public.trades.rules_followed IS 'Whether trading rules were followed: Yes, No';
COMMENT ON COLUMN public.trades.confidence IS 'Confidence level 1-5';
COMMENT ON COLUMN public.trades.trade_grade IS 'Self-assessed trade execution grade: A, B, C';