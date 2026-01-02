-- Create setup_types registry table
CREATE TABLE public.setup_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT setup_code_format CHECK (code ~ '^[A-Z0-9]{2,6}$'),
  CONSTRAINT unique_user_setup_code UNIQUE (user_id, code)
);

-- Enable RLS
ALTER TABLE public.setup_types ENABLE ROW LEVEL SECURITY;

-- RLS policies - owner only (matching trades_v2_elite pattern)
CREATE POLICY "owner_only_setup_types_access" 
ON public.setup_types 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'owner'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'owner'
));

-- Add setup_type_id to trades_v2_elite (nullable for backward compat)
ALTER TABLE public.trades_v2_elite 
ADD COLUMN setup_type_id UUID REFERENCES public.setup_types(id);

-- Create index for analytics performance
CREATE INDEX idx_trades_v2_elite_setup_type_id ON public.trades_v2_elite(setup_type_id);
CREATE INDEX idx_setup_types_user_active ON public.setup_types(user_id, is_active);

-- Trigger for updated_at
CREATE TRIGGER update_setup_types_updated_at
BEFORE UPDATE ON public.setup_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();