-- Drop and recreate the gestor/admin policies with correct argument order

-- First, drop the existing policies
DROP POLICY IF EXISTS "Gestores can view all proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can view all proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can update all proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can delete all proposals" ON public.proposals;

-- Recreate with explicit type casting to ensure correct argument types
CREATE POLICY "Gestores can view all proposals"
ON public.proposals
FOR SELECT
USING (public.has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins can view all proposals"
ON public.proposals
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all proposals"
ON public.proposals
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all proposals"
ON public.proposals
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));