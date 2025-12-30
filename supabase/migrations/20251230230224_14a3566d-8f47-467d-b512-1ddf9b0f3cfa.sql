-- Add optional second LTF screenshot field for trade screenshot
ALTER TABLE public.trades_v2_elite 
ADD COLUMN IF NOT EXISTS ltf_trade_screenshot TEXT;