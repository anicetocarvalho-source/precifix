
-- Add event-specific columns to proposals table
ALTER TABLE public.proposals
ADD COLUMN event_type text,
ADD COLUMN coverage_duration text,
ADD COLUMN event_date date,
ADD COLUMN event_days integer DEFAULT 1,
ADD COLUMN event_staffing jsonb DEFAULT '{"videographers": 1, "photographers": 1, "assistants": 0}'::jsonb,
ADD COLUMN event_extras jsonb DEFAULT '{"drone": false, "streaming": false, "lighting": false}'::jsonb,
ADD COLUMN post_production_hours integer DEFAULT 8;

-- Add web/systems-specific columns to proposals table
ALTER TABLE public.proposals
ADD COLUMN web_project_type text,
ADD COLUMN number_of_pages integer DEFAULT 5,
ADD COLUMN number_of_modules integer DEFAULT 3,
ADD COLUMN has_payment_integration boolean DEFAULT false,
ADD COLUMN has_crm_integration boolean DEFAULT false,
ADD COLUMN has_erp_integration boolean DEFAULT false,
ADD COLUMN has_maintenance boolean DEFAULT false,
ADD COLUMN maintenance_months integer DEFAULT 6;

-- Add design-specific columns to proposals table
ALTER TABLE public.proposals
ADD COLUMN number_of_concepts integer DEFAULT 3,
ADD COLUMN number_of_revisions integer DEFAULT 2,
ADD COLUMN deliverable_formats text[] DEFAULT '{}'::text[],
ADD COLUMN includes_brand_guidelines boolean DEFAULT false;

-- Add event-specific columns to proposal_versions table
ALTER TABLE public.proposal_versions
ADD COLUMN event_type text,
ADD COLUMN coverage_duration text,
ADD COLUMN event_date date,
ADD COLUMN event_days integer DEFAULT 1,
ADD COLUMN event_staffing jsonb DEFAULT '{"videographers": 1, "photographers": 1, "assistants": 0}'::jsonb,
ADD COLUMN event_extras jsonb DEFAULT '{"drone": false, "streaming": false, "lighting": false}'::jsonb,
ADD COLUMN post_production_hours integer DEFAULT 8;

-- Add web/systems-specific columns to proposal_versions table
ALTER TABLE public.proposal_versions
ADD COLUMN web_project_type text,
ADD COLUMN number_of_pages integer DEFAULT 5,
ADD COLUMN number_of_modules integer DEFAULT 3,
ADD COLUMN has_payment_integration boolean DEFAULT false,
ADD COLUMN has_crm_integration boolean DEFAULT false,
ADD COLUMN has_erp_integration boolean DEFAULT false,
ADD COLUMN has_maintenance boolean DEFAULT false,
ADD COLUMN maintenance_months integer DEFAULT 6;

-- Add design-specific columns to proposal_versions table
ALTER TABLE public.proposal_versions
ADD COLUMN number_of_concepts integer DEFAULT 3,
ADD COLUMN number_of_revisions integer DEFAULT 2,
ADD COLUMN deliverable_formats text[] DEFAULT '{}'::text[],
ADD COLUMN includes_brand_guidelines boolean DEFAULT false;
