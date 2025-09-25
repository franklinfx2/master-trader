-- Create affiliate system tables

-- Table to track referrals
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id),
  UNIQUE(referral_code, referred_id)
);

-- Table to track commissions
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL DEFAULT 0.20,
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Table to track payout requests
CREATE TABLE public.payout_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  payment_method TEXT,
  payment_details JSONB,
  admin_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES profiles(id)
);

-- Add referral_code to profiles table
ALTER TABLE public.profiles 
ADD COLUMN referral_code TEXT UNIQUE,
ADD COLUMN total_earnings NUMERIC DEFAULT 0,
ADD COLUMN pending_balance NUMERIC DEFAULT 0,
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Generate referral codes for existing users
UPDATE public.profiles 
SET referral_code = UPPER(SUBSTRING(MD5(id::text), 1, 8)) 
WHERE referral_code IS NULL;

-- Enable RLS on new tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for commissions
CREATE POLICY "Users can view their own commissions" 
ON public.commissions 
FOR SELECT 
USING (auth.uid() = referrer_id);

CREATE POLICY "System can manage commissions" 
ON public.commissions 
FOR ALL 
USING (true);

-- RLS Policies for payout requests
CREATE POLICY "Users can view their own payout requests" 
ON public.payout_requests 
FOR SELECT 
USING (auth.uid() = affiliate_id);

CREATE POLICY "Users can create their own payout requests" 
ON public.payout_requests 
FOR INSERT 
WITH CHECK (auth.uid() = affiliate_id);

CREATE POLICY "Users can update their own pending payout requests" 
ON public.payout_requests 
FOR UPDATE 
USING (auth.uid() = affiliate_id AND status = 'pending');

-- Function to generate referral code for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code = UPPER(SUBSTRING(MD5(NEW.id::text), 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate referral code
CREATE TRIGGER generate_referral_code_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT is_admin FROM public.profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for viewing all data
CREATE POLICY "Admins can view all referrals" 
ON public.referrals 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all commissions" 
ON public.commissions 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all payout requests" 
ON public.payout_requests 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update payout requests" 
ON public.payout_requests 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX idx_commissions_referrer ON public.commissions(referrer_id);
CREATE INDEX idx_payout_requests_affiliate ON public.payout_requests(affiliate_id);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);