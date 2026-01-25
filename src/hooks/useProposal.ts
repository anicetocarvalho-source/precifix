import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProposalFormData, Proposal, ProposalStatus, ClientType, ServiceType, Complexity, Methodology, SavedPricingParams } from '@/types/proposal';
import { calculatePricing, DEFAULT_PRICING_PARAMS, PricingParams } from '@/lib/pricing';
import { ProposalWithAuthor } from './useProposals';

// Helper to convert saved pricing params to full PricingParams
function savedParamsToFull(saved: SavedPricingParams): PricingParams {
  return {
    hourlyRates: {
      ...DEFAULT_PRICING_PARAMS.hourlyRates,
      ...saved.hourlyRates,
    },
    complexityMultipliers: saved.complexityMultipliers,
    extrasPricing: saved.extrasPricing || DEFAULT_PRICING_PARAMS.extrasPricing,
    overheadPercentage: saved.overheadPercentage,
    marginPercentage: saved.marginPercentage,
  };
}

export function useProposal(proposalId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: async (): Promise<ProposalWithAuthor | null> => {
      if (!proposalId || !user) return null;

      // Fetch the specific proposal
      const { data: row, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching proposal:', error);
        throw error;
      }

      if (!row) return null;

      // Fetch author profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', row.user_id)
        .maybeSingle();

      // Count services for this proposal
      const { count: servicesCount } = await supabase
        .from('proposal_services')
        .select('*', { count: 'exact', head: true })
        .eq('proposal_id', proposalId);

      const formData: ProposalFormData = {
        clientType: row.client_type as ClientType,
        clientName: row.client_name,
        clientEmail: row.client_email || undefined,
        clientPhone: row.client_phone || undefined,
        sector: row.sector,
        serviceType: row.service_type as ServiceType,
        estimatedDuration: row.duration_months,
        durationUnit: 'months',
        locations: row.locations,
        complexity: row.complexity as Complexity,
        clientMaturity: row.maturity_level as 'low' | 'medium' | 'high',
        deliverables: row.deliverables,
        hasExistingTeam: row.has_existing_team,
        methodology: row.methodology as Methodology,
        // Event-specific fields
        eventType: row.event_type as ProposalFormData['eventType'],
        coverageDuration: row.coverage_duration as ProposalFormData['coverageDuration'],
        eventDate: row.event_date || undefined,
        eventDays: row.event_days || undefined,
        eventStaffing: row.event_staffing as ProposalFormData['eventStaffing'],
        eventExtras: row.event_extras as ProposalFormData['eventExtras'],
        includesPostProduction: (row.post_production_hours || 0) > 0,
        // Web/Systems-specific fields
        webSystemsData: row.web_project_type ? {
          projectType: row.web_project_type as ProposalFormData['webSystemsData'] extends { projectType?: infer T } ? T : never,
          numberOfPages: row.number_of_pages || 5,
          numberOfModules: row.number_of_modules || 3,
          hasPaymentIntegration: row.has_payment_integration || false,
          hasCrmIntegration: row.has_crm_integration || false,
          hasErpIntegration: row.has_erp_integration || false,
          hasMaintenanceSupport: row.has_maintenance || false,
          maintenanceMonths: row.maintenance_months || 6,
        } as ProposalFormData['webSystemsData'] : undefined,
        // Design-specific fields
        designData: row.number_of_concepts ? {
          numberOfConcepts: row.number_of_concepts,
          numberOfRevisions: row.number_of_revisions || 2,
          deliverableFormats: row.deliverable_formats || [],
          includesBrandGuidelines: row.includes_brand_guidelines || false,
        } : undefined,
      };

      // Use saved pricing params if available
      const savedPricingParams = row.pricing_params as unknown as SavedPricingParams | null;
      const paramsToUse = savedPricingParams 
        ? savedParamsToFull(savedPricingParams)
        : DEFAULT_PRICING_PARAMS;

      return {
        id: row.id,
        formData,
        pricing: calculatePricing(formData, paramsToUse),
        pricingParams: savedPricingParams || undefined,
        status: row.status as ProposalStatus,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        authorName: profile?.full_name || 'Utilizador desconhecido',
        authorId: row.user_id,
        isOwner: row.user_id === user.id,
        servicesCount: servicesCount || 0,
      };
    },
    enabled: !!proposalId && !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
}
