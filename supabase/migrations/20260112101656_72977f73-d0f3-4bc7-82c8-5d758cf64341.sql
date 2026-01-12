-- Add client_email column to proposals table
ALTER TABLE public.proposals 
ADD COLUMN client_email text;

-- Add client_email column to proposal_versions table
ALTER TABLE public.proposal_versions 
ADD COLUMN client_email text;