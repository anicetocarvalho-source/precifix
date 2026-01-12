-- Create proposal_versions table to store history of changes
CREATE TABLE public.proposal_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  client_name TEXT NOT NULL,
  client_type TEXT NOT NULL,
  sector TEXT NOT NULL,
  service_type TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  locations TEXT[] NOT NULL DEFAULT '{}',
  complexity TEXT NOT NULL,
  maturity_level TEXT NOT NULL,
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  has_existing_team BOOLEAN NOT NULL DEFAULT false,
  methodology TEXT NOT NULL,
  total_value NUMERIC NOT NULL,
  status TEXT NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.proposal_versions ENABLE ROW LEVEL SECURITY;

-- Users can view versions of their own proposals
CREATE POLICY "Users can view versions of their own proposals"
ON public.proposal_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_versions.proposal_id 
    AND proposals.user_id = auth.uid()
  )
);

-- Users can create versions for their own proposals
CREATE POLICY "Users can create versions for their own proposals"
ON public.proposal_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_versions.proposal_id 
    AND proposals.user_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_proposal_versions_proposal_id ON public.proposal_versions(proposal_id);
CREATE INDEX idx_proposal_versions_created_at ON public.proposal_versions(created_at DESC);