import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProposalFormData, Proposal, ProposalStatus, ClientType, ServiceType, Complexity, Methodology, SavedPricingParams } from '@/types/proposal';
import { calculatePricing, PricingParams, DEFAULT_PRICING_PARAMS } from '@/lib/pricing';
import { toast } from 'sonner';

// Hook to fetch pricing parameters
function usePricingParams(userId: string | undefined) {
  return useQuery({
    queryKey: ['pricing-parameters', userId],
    queryFn: async (): Promise<PricingParams> => {
      if (!userId) return DEFAULT_PRICING_PARAMS;

      const { data, error } = await supabase
        .from('pricing_parameters')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return DEFAULT_PRICING_PARAMS;
      }

      return {
        hourlyRates: {
          seniorManager: Number(data.rate_senior_manager),
          consultant: Number(data.rate_consultant),
          analyst: Number(data.rate_analyst),
          coordinator: Number(data.rate_coordinator),
          trainer: Number(data.rate_trainer),
        },
        complexityMultipliers: {
          low: Number(data.multiplier_low),
          medium: Number(data.multiplier_medium),
          high: Number(data.multiplier_high),
        },
        overheadPercentage: Number(data.overhead_percentage),
        marginPercentage: Number(data.margin_percentage),
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useProposals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: pricingParams = DEFAULT_PRICING_PARAMS } = usePricingParams(user?.id);

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals', user?.id, pricingParams],
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
          clientPhone: row.client_phone || undefined,
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

        // Use saved pricing params if available, otherwise use current params
        const savedPricingParams = row.pricing_params as unknown as SavedPricingParams | null;
        const paramsToUse = savedPricingParams ? {
          hourlyRates: savedPricingParams.hourlyRates,
          complexityMultipliers: savedPricingParams.complexityMultipliers,
          overheadPercentage: savedPricingParams.overheadPercentage,
          marginPercentage: savedPricingParams.marginPercentage,
        } : pricingParams;

        return {
          id: row.id,
          formData,
          pricing: calculatePricing(formData, paramsToUse),
          pricingParams: savedPricingParams || undefined,
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

      const pricing = calculatePricing(formData, pricingParams);

      // Create pricing params snapshot to store with proposal
      const pricingParamsSnapshot = {
        hourlyRates: pricingParams.hourlyRates,
        complexityMultipliers: pricingParams.complexityMultipliers,
        overheadPercentage: pricingParams.overheadPercentage,
        marginPercentage: pricingParams.marginPercentage,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert({
          user_id: user.id,
          client_name: formData.clientName,
          client_email: formData.clientEmail || null,
          client_phone: formData.clientPhone || null,
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
          pricing_params: pricingParamsSnapshot,
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
      const pricing = calculatePricing(formData, pricingParams);

      // Create pricing params snapshot for the duplicate
      const pricingParamsSnapshot = {
        hourlyRates: pricingParams.hourlyRates,
        complexityMultipliers: pricingParams.complexityMultipliers,
        overheadPercentage: pricingParams.overheadPercentage,
        marginPercentage: pricingParams.marginPercentage,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert({
          user_id: user.id,
          client_name: `${formData.clientName} (Cópia)`,
          client_email: formData.clientEmail || null,
          client_phone: formData.clientPhone || null,
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
          pricing_params: pricingParamsSnapshot,
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

        const currentPricing = calculatePricing(currentProposal.formData, pricingParams);

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

      const pricing = calculatePricing(formData, pricingParams);

      // Create pricing params snapshot for the update
      const pricingParamsSnapshot = {
        hourlyRates: pricingParams.hourlyRates,
        complexityMultipliers: pricingParams.complexityMultipliers,
        overheadPercentage: pricingParams.overheadPercentage,
        marginPercentage: pricingParams.marginPercentage,
      };

      const { error } = await supabase
        .from('proposals')
        .update({
          client_name: formData.clientName,
          client_email: formData.clientEmail || null,
          client_phone: formData.clientPhone || null,
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
          pricing_params: pricingParamsSnapshot,
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
