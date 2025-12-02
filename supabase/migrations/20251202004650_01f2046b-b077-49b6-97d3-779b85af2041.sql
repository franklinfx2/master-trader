-- Add AI credit tracking fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ai_credits_remaining integer DEFAULT 20,
ADD COLUMN IF NOT EXISTS ai_credits_monthly_limit integer DEFAULT 20,
ADD COLUMN IF NOT EXISTS ai_credits_reset_date timestamp with time zone DEFAULT (now() + interval '1 month'),
ADD COLUMN IF NOT EXISTS ai_response_priority text DEFAULT 'slow' CHECK (ai_response_priority IN ('slow', 'fast', 'fastest'));

-- Create credit usage history table for tracking
CREATE TABLE IF NOT EXISTS public.ai_credit_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  feature_name text NOT NULL,
  credits_used integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on credit usage table
ALTER TABLE public.ai_credit_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own credit usage
CREATE POLICY "Users can view own credit usage"
ON public.ai_credit_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can insert credit usage
CREATE POLICY "System can insert credit usage"
ON public.ai_credit_usage
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Function to deduct AI credits
CREATE OR REPLACE FUNCTION public.deduct_ai_credits(
  p_user_id uuid,
  p_credits integer,
  p_feature_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining integer;
BEGIN
  -- Check if user has enough credits
  SELECT ai_credits_remaining INTO v_remaining
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_remaining < p_credits THEN
    RETURN false;
  END IF;
  
  -- Deduct credits
  UPDATE profiles
  SET ai_credits_remaining = ai_credits_remaining - p_credits
  WHERE id = p_user_id;
  
  -- Log usage
  INSERT INTO ai_credit_usage (user_id, credits_used, feature_name)
  VALUES (p_user_id, p_credits, p_feature_name);
  
  RETURN true;
END;
$$;

-- Function to reset monthly credits
CREATE OR REPLACE FUNCTION public.reset_monthly_ai_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET 
    ai_credits_remaining = ai_credits_monthly_limit,
    ai_credits_reset_date = now() + interval '1 month'
  WHERE ai_credits_reset_date <= now();
END;
$$;

-- Update existing users based on their plan
UPDATE public.profiles
SET 
  ai_credits_remaining = CASE 
    WHEN plan = 'pro' THEN 999999
    WHEN plan = 'go' THEN 200
    ELSE 20
  END,
  ai_credits_monthly_limit = CASE 
    WHEN plan = 'pro' THEN 999999
    WHEN plan = 'go' THEN 200
    ELSE 20
  END,
  ai_response_priority = CASE 
    WHEN plan = 'pro' THEN 'fastest'
    WHEN plan = 'go' THEN 'fast'
    ELSE 'slow'
  END
WHERE ai_credits_remaining IS NULL;