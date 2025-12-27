-- Add new values to liquidity_target_enum
ALTER TYPE public.liquidity_target_enum ADD VALUE IF NOT EXISTS 'Structural Liquidity';
ALTER TYPE public.liquidity_target_enum ADD VALUE IF NOT EXISTS 'Displacement';