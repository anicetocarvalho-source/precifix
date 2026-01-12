-- Create pricing_parameters table to store configurable pricing values
CREATE TABLE public.pricing_parameters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  
  -- Hourly rates (in Kz)
  rate_senior_manager numeric NOT NULL DEFAULT 100000,
  rate_consultant numeric NOT NULL DEFAULT 75000,
  rate_analyst numeric NOT NULL DEFAULT 45000,
  rate_coordinator numeric NOT NULL DEFAULT 60000,
  rate_trainer numeric NOT NULL DEFAULT 50000,
  
  -- Complexity multipliers
  multiplier_low numeric NOT NULL DEFAULT 1,
  multiplier_medium numeric NOT NULL DEFAULT 1.2,
  multiplier_high numeric NOT NULL DEFAULT 1.5,
  
  -- Percentages
  overhead_percentage numeric NOT NULL DEFAULT 0.15,
  margin_percentage numeric NOT NULL DEFAULT 0.25,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.pricing_parameters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own pricing parameters"
ON public.pricing_parameters
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pricing parameters"
ON public.pricing_parameters
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pricing parameters"
ON public.pricing_parameters
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pricing_parameters_updated_at
BEFORE UPDATE ON public.pricing_parameters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();