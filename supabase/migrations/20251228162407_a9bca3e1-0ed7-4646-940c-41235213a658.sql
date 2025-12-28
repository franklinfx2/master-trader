-- Add trade_time column to trades_v2_elite table
ALTER TABLE public.trades_v2_elite 
ADD COLUMN trade_time text;