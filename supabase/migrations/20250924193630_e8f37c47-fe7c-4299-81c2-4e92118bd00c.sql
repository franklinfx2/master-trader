-- Create daily_risk_tracker table
CREATE TABLE public.daily_risk_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  risk_limit NUMERIC NOT NULL DEFAULT 100,
  used_risk NUMERIC NOT NULL DEFAULT 0,
  trades_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_risk_tracker ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own risk data" 
ON public.daily_risk_tracker 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own risk data" 
ON public.daily_risk_tracker 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk data" 
ON public.daily_risk_tracker 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own risk data" 
ON public.daily_risk_tracker 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_risk_tracker_updated_at
  BEFORE UPDATE ON public.daily_risk_tracker
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();