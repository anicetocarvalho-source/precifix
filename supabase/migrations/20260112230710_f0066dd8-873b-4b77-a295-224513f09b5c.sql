-- Add RLS policy for gestores to view all proposals
CREATE POLICY "Gestores can view all proposals"
ON public.proposals
FOR SELECT
USING (has_role(auth.uid(), 'gestor'));

-- Add RLS policy for admins to view all proposals  
CREATE POLICY "Admins can view all proposals"
ON public.proposals
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to update all proposals
CREATE POLICY "Admins can update all proposals"
ON public.proposals
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to delete all proposals
CREATE POLICY "Admins can delete all proposals"
ON public.proposals
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for gestores and admins to view all proposal versions
CREATE POLICY "Gestores can view all proposal versions"
ON public.proposal_versions
FOR SELECT
USING (has_role(auth.uid(), 'gestor'));

CREATE POLICY "Admins can view all proposal versions"
ON public.proposal_versions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));