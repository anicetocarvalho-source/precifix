-- Add pricing parameters snapshot columns to proposals table
ALTER TABLE public.proposals
ADD COLUMN pricing_params JSONB DEFAULT NULL;

-- Add pricing parameters snapshot columns to proposal_versions table
ALTER TABLE public.proposal_versions
ADD COLUMN pricing_params JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.proposals.pricing_params IS 'Snapshot of pricing parameters used when calculating this proposal';
COMMENT ON COLUMN public.proposal_versions.pricing_params IS 'Snapshot of pricing parameters used when calculating this version';