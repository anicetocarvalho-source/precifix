-- Create a new table for proposal services (each proposal can have multiple services)
CREATE TABLE public.proposal_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  complexity TEXT NOT NULL DEFAULT 'medium',
  estimated_duration INTEGER NOT NULL DEFAULT 1,
  duration_unit TEXT NOT NULL DEFAULT 'months',
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  
  -- Event-specific fields
  event_type TEXT,
  event_date DATE,
  event_days INTEGER DEFAULT 1,
  event_staffing JSONB DEFAULT '{"assistants": 0, "photographers": 1, "videographers": 1}'::jsonb,
  event_extras JSONB DEFAULT '{"drone": false, "lighting": false, "streaming": false}'::jsonb,
  coverage_duration TEXT,
  post_production_hours INTEGER DEFAULT 8,
  
  -- Web/Systems fields
  web_project_type TEXT,
  number_of_pages INTEGER DEFAULT 5,
  number_of_modules INTEGER DEFAULT 3,
  has_payment_integration BOOLEAN DEFAULT false,
  has_crm_integration BOOLEAN DEFAULT false,
  has_erp_integration BOOLEAN DEFAULT false,
  has_maintenance BOOLEAN DEFAULT false,
  maintenance_months INTEGER DEFAULT 6,
  
  -- Design fields
  number_of_concepts INTEGER DEFAULT 3,
  number_of_revisions INTEGER DEFAULT 2,
  includes_brand_guidelines BOOLEAN DEFAULT false,
  deliverable_formats TEXT[] DEFAULT '{}',
  
  -- Pricing for this service
  service_value NUMERIC NOT NULL DEFAULT 0,
  
  -- Order for display
  display_order INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposal_services ENABLE ROW LEVEL SECURITY;

-- Create policies for proposal_services
CREATE POLICY "Users can view services of their own proposals"
ON public.proposal_services
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM proposals
  WHERE proposals.id = proposal_services.proposal_id
  AND proposals.user_id = auth.uid()
));

CREATE POLICY "Users can create services for their own proposals"
ON public.proposal_services
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM proposals
  WHERE proposals.id = proposal_services.proposal_id
  AND proposals.user_id = auth.uid()
));

CREATE POLICY "Users can update services of their own proposals"
ON public.proposal_services
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM proposals
  WHERE proposals.id = proposal_services.proposal_id
  AND proposals.user_id = auth.uid()
));

CREATE POLICY "Users can delete services from their own proposals"
ON public.proposal_services
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM proposals
  WHERE proposals.id = proposal_services.proposal_id
  AND proposals.user_id = auth.uid()
));

-- Admin policies
CREATE POLICY "Admins can view all proposal services"
ON public.proposal_services
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all proposal services"
ON public.proposal_services
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all proposal services"
ON public.proposal_services
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Gestor policies
CREATE POLICY "Gestores can view all proposal services"
ON public.proposal_services
FOR SELECT
USING (has_role(auth.uid(), 'gestor'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_proposal_services_updated_at
  BEFORE UPDATE ON public.proposal_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_proposal_services_proposal_id ON public.proposal_services(proposal_id);
CREATE INDEX idx_proposal_services_service_type ON public.proposal_services(service_type);