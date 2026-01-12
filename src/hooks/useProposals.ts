import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProposalFormData, Proposal, ProposalStatus, ClientType, ServiceType, Complexity, Methodology } from '@/types/proposal';
import { calculatePricing } from '@/lib/pricing';
import { toast } from 'sonner';

export function useProposals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
        throw error;
      }

      // Transform database rows to Proposal objects
      return data.map((row): Proposal => {
        const formData: ProposalFormData = {
          clientType: row.client_type as ClientType,
          clientName: row.client_name,
          clientEmail: row.client_email || undefined,
          sector: row.sector,
          serviceType: row.service_type as ServiceType,
          estimatedDuration: row.duration_months,
          locations: row.locations,
          complexity: row.complexity as Complexity,
          clientMaturity: row.maturity_level as 'low' | 'medium' | 'high',
          deliverables: row.deliverables,
          hasExistingTeam: row.has_existing_team,
          methodology: row.methodology as Methodology,
        };

        return {
          id: row.id,
          formData,
          pricing: calculatePricing(formData),
          status: row.status as ProposalStatus,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      });
    },
    enabled: !!user,
  });

  const createProposal = useMutation({
    mutationFn: async (formData: ProposalFormData) => {
      if (!user) throw new Error('User not authenticated');

      const pricing = calculatePricing(formData);

      const { data, error } = await supabase
        .from('proposals')
        .insert({
          user_id: user.id,
          client_name: formData.clientName,
          client_email: formData.clientEmail || null,
          client_type: formData.clientType,
          sector: formData.sector,
          service_type: formData.serviceType,
          duration_months: formData.estimatedDuration,
          locations: formData.locations,
          complexity: formData.complexity,
          maturity_level: formData.clientMaturity,
          deliverables: formData.deliverables,
          has_existing_team: formData.hasExistingTeam,
          methodology: formData.methodology,
          total_value: pricing.finalPrice,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposta criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating proposal:', error);
      toast.error('Erro ao criar proposta');
    },
  });

  const updateProposalStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProposalStatus }) => {
      const { error } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Estado atualizado!');
    },
    onError: (error) => {
      console.error('Error updating proposal:', error);
      toast.error('Erro ao atualizar proposta');
    },
  });

  const deleteProposal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposta eliminada!');
    },
    onError: (error) => {
      console.error('Error deleting proposal:', error);
      toast.error('Erro ao eliminar proposta');
    },
  });

  const duplicateProposal = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const proposal = proposals.find((p) => p.id === id);
      if (!proposal) throw new Error('Proposal not found');

      const { formData } = proposal;
      const pricing = calculatePricing(formData);

      const { data, error } = await supabase
        .from('proposals')
        .insert({
          user_id: user.id,
          client_name: `${formData.clientName} (Cópia)`,
          client_email: formData.clientEmail || null,
          client_type: formData.clientType,
          sector: formData.sector,
          service_type: formData.serviceType,
          duration_months: formData.estimatedDuration,
          locations: formData.locations,
          complexity: formData.complexity,
          maturity_level: formData.clientMaturity,
          deliverables: formData.deliverables,
          has_existing_team: formData.hasExistingTeam,
          methodology: formData.methodology,
          total_value: pricing.finalPrice,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposta duplicada com sucesso!');
    },
    onError: (error) => {
      console.error('Error duplicating proposal:', error);
      toast.error('Erro ao duplicar proposta');
    },
  });

  const updateProposal = useMutation({
    mutationFn: async ({ id, formData, changeSummary }: { id: string; formData: ProposalFormData; changeSummary?: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Get current proposal state before updating
      const currentProposal = proposals.find((p) => p.id === id);
      
      // Save current state as a version before updating
      if (currentProposal) {
        // Get max version number
        const { data: existingVersions } = await supabase
          .from('proposal_versions')
          .select('version_number')
          .eq('proposal_id', id)
          .order('version_number', { ascending: false })
          .limit(1);

        const nextVersionNumber = existingVersions && existingVersions.length > 0
          ? (existingVersions[0] as { version_number: number }).version_number + 1
          : 1;

        const currentPricing = calculatePricing(currentProposal.formData);

        await supabase
          .from('proposal_versions')
          .insert({
            proposal_id: id,
            version_number: nextVersionNumber,
            client_name: currentProposal.formData.clientName,
            client_type: currentProposal.formData.clientType,
            sector: currentProposal.formData.sector,
            service_type: currentProposal.formData.serviceType,
            duration_months: currentProposal.formData.estimatedDuration,
            locations: currentProposal.formData.locations,
            complexity: currentProposal.formData.complexity,
            maturity_level: currentProposal.formData.clientMaturity,
            deliverables: currentProposal.formData.deliverables,
            has_existing_team: currentProposal.formData.hasExistingTeam,
            methodology: currentProposal.formData.methodology,
            total_value: currentPricing.finalPrice,
            status: currentProposal.status,
            change_summary: changeSummary || 'Versão anterior guardada',
            created_by: user.id,
          });
      }

      const pricing = calculatePricing(formData);

      const { error } = await supabase
        .from('proposals')
        .update({
          client_name: formData.clientName,
          client_email: formData.clientEmail || null,
          client_type: formData.clientType,
          sector: formData.sector,
          service_type: formData.serviceType,
          duration_months: formData.estimatedDuration,
          locations: formData.locations,
          complexity: formData.complexity,
          maturity_level: formData.clientMaturity,
          deliverables: formData.deliverables,
          has_existing_team: formData.hasExistingTeam,
          methodology: formData.methodology,
          total_value: pricing.finalPrice,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-versions', variables.id] });
      toast.success('Proposta atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating proposal:', error);
      toast.error('Erro ao atualizar proposta');
    },
  });

  const getProposal = (id: string) => {
    return proposals.find((p) => p.id === id);
  };

  return {
    proposals,
    isLoading,
    createProposal,
    updateProposal,
    updateProposalStatus,
    deleteProposal,
    duplicateProposal,
    getProposal,
  };
}
