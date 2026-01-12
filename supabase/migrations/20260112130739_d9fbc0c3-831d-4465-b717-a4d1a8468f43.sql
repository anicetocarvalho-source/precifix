-- Add client_phone column to proposals table
ALTER TABLE public.proposals
ADD COLUMN client_phone text;

-- Add client_phone column to proposal_versions table
ALTER TABLE public.proposal_versions
ADD COLUMN client_phone text;