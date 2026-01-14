-- Create service_templates table for storing pre-configured service templates
CREATE TABLE public.service_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL,
  complexity TEXT NOT NULL DEFAULT 'medium',
  estimated_duration INTEGER NOT NULL DEFAULT 1,
  duration_unit TEXT NOT NULL DEFAULT 'months',
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  
  -- Event fields
  event_type TEXT,
  event_days INTEGER,
  event_staffing JSONB DEFAULT '{"photographers": 1, "videographers": 1, "assistants": 0}'::jsonb,
  event_extras JSONB DEFAULT '{"drone": false, "lighting": false, "streaming": false}'::jsonb,
  coverage_duration TEXT,
  post_production_hours INTEGER,
  
  -- Web/Systems fields
  web_project_type TEXT,
  number_of_pages INTEGER,
  number_of_modules INTEGER,
  has_payment_integration BOOLEAN DEFAULT false,
  has_crm_integration BOOLEAN DEFAULT false,
  has_erp_integration BOOLEAN DEFAULT false,
  has_maintenance BOOLEAN DEFAULT false,
  maintenance_months INTEGER,
  
  -- Design fields
  number_of_concepts INTEGER,
  number_of_revisions INTEGER,
  includes_brand_guidelines BOOLEAN DEFAULT false,
  deliverable_formats TEXT[] DEFAULT '{}',
  
  -- Metadata
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_templates ENABLE ROW LEVEL SECURITY;

-- Users can view system templates (available to everyone)
CREATE POLICY "Anyone can view system templates"
ON public.service_templates
FOR SELECT
USING (is_system_template = true);

-- Users can view their own templates
CREATE POLICY "Users can view their own templates"
ON public.service_templates
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own templates
CREATE POLICY "Users can create their own templates"
ON public.service_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_system_template = false);

-- Users can update their own templates
CREATE POLICY "Users can update their own templates"
ON public.service_templates
FOR UPDATE
USING (auth.uid() = user_id AND is_system_template = false);

-- Users can delete their own templates
CREATE POLICY "Users can delete their own templates"
ON public.service_templates
FOR DELETE
USING (auth.uid() = user_id AND is_system_template = false);

-- Create trigger for updated_at
CREATE TRIGGER update_service_templates_updated_at
BEFORE UPDATE ON public.service_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert system templates (pre-defined)
INSERT INTO public.service_templates (name, description, service_type, complexity, estimated_duration, duration_unit, deliverables, is_system_template, event_type, event_days, coverage_duration, post_production_hours) VALUES
('Cobertura de Evento Corporativo', 'Cobertura fotográfica e vídeo para eventos empresariais de 1 dia', 'event_coverage', 'medium', 1, 'days', ARRAY['Fotos editadas', 'Vídeo highlights', 'Entrega digital'], true, 'corporate', 1, 'full_day', 8),
('Cobertura de Casamento Premium', 'Cobertura completa de casamento com drone e streaming', 'event_coverage', 'high', 1, 'days', ARRAY['Álbum digital', 'Vídeo cerimónia', 'Vídeo festa', 'Fotos editadas'], true, 'wedding', 1, 'full_day', 16);

INSERT INTO public.service_templates (name, description, service_type, complexity, estimated_duration, duration_unit, deliverables, is_system_template, web_project_type, number_of_pages, has_maintenance, maintenance_months) VALUES
('Website Institucional', 'Website corporativo com até 10 páginas', 'web_development', 'medium', 2, 'months', ARRAY['Website responsivo', 'Painel de gestão', 'SEO básico', 'Integração analytics'], true, 'institutional', 10, true, 12),
('Loja Online Básica', 'E-commerce com até 50 produtos', 'web_development', 'high', 3, 'months', ARRAY['Loja online', 'Carrinho de compras', 'Gateway de pagamento', 'Gestão de stock'], true, 'ecommerce', 15, true, 12);

INSERT INTO public.service_templates (name, description, service_type, complexity, estimated_duration, duration_unit, deliverables, is_system_template, number_of_concepts, number_of_revisions, includes_brand_guidelines, deliverable_formats) VALUES
('Identidade Visual Completa', 'Criação de logótipo e manual de marca', 'branding', 'high', 1, 'months', ARRAY['Logótipo', 'Paleta de cores', 'Tipografia', 'Manual de marca'], true, 3, 3, true, ARRAY['AI', 'PDF', 'PNG', 'SVG']),
('Design de Embalagem', 'Design de packaging para produto', 'packaging_design', 'medium', 3, 'weeks', ARRAY['Design de embalagem', 'Mockups 3D', 'Ficheiros para impressão'], true, 2, 2, false, ARRAY['AI', 'PDF']);