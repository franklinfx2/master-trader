-- Create news_impact_enum
CREATE TYPE public.news_impact_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Create news_timing_enum
CREATE TYPE public.news_timing_enum AS ENUM ('PRE_NEWS', 'AT_RELEASE', 'POST_NEWS');

-- Create news_type_enum
CREATE TYPE public.news_type_enum AS ENUM ('INFLATION', 'RATES', 'EMPLOYMENT', 'RISK_SENTIMENT', 'NONE');

-- Add new columns to trades_v2_elite
ALTER TABLE public.trades_v2_elite 
ADD COLUMN news_impact public.news_impact_enum,
ADD COLUMN news_timing public.news_timing_enum,
ADD COLUMN news_type public.news_type_enum;