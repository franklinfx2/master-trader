-- Add streak tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN last_log_date DATE,
ADD COLUMN current_streak INTEGER DEFAULT 0,
ADD COLUMN highest_streak INTEGER DEFAULT 0,
ADD COLUMN streak_shields INTEGER DEFAULT 0;