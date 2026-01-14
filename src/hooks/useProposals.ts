import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProposalFormData, Proposal, ProposalStatus, ClientType, ServiceType, Complexity, Methodology, SavedPricingParams } from '@/types/proposal';
import { ProposalService } from '@/types/proposalService';
import { calculatePricing, DEFAULT_PRICING_PARAMS, PricingParams } from '@/lib/pricing';
import { calculateMultiServicePricing, updateServicesWithPricing } from '@/lib/pricingMultiService';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Interface for proposal with author info
export interface ProposalWithAuthor extends Proposal {
  authorName?: string;
  authorId: string;
  isOwner: boolean;
}

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

      // Map database values, using defaults for creative fields not yet in DB
      return {
        hourlyRates: {
          seniorManager: Number(data.rate_senior_manager),
          consultant: Number(data.rate_consultant),
          analyst: Number(data.rate_analyst),
          coordinator: Number(data.rate_coordinator),
          trainer: Number(data.rate_trainer),
          // Creative rates - use defaults since not in DB yet
          videographer: DEFAULT_PRICING_PARAMS.hourlyRates.videographer,
          photographer: DEFAULT_PRICING_PARAMS.hourlyRates.photographer,
          videoEditor: DEFAULT_PRICING_PARAMS.hourlyRates.videoEditor,
          graphicDesigner: DEFAULT_PRICING_PARAMS.hourlyRates.graphicDesigner,
          webDeveloper: DEFAULT_PRICING_PARAMS.hourlyRates.webDeveloper,
          soundTechnician: DEFAULT_PRICING_PARAMS.hourlyRates.soundTechnician,
          lightingTechnician: DEFAULT_PRICING_PARAMS.hourlyRates.lightingTechnician,
        },
        complexityMultipliers: {
          low: Number(data.multiplier_low),
          medium: Number(data.multiplier_medium),
          high: Number(data.multiplier_high),
        },
        extrasPricing: DEFAULT_PRICING_PARAMS.extrasPricing,
        overheadPercentage: Number(data.overhead_percentage),
        marginPercentage: Number(data.margin_percentage),
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

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

// Helper to convert SavedPricingParams to Json type
function pricingParamsToJson(params: SavedPricingParams): Json {
  return {
    hourlyRates: params.hourlyRates,
    complexityMultipliers: params.complexityMultipliers,
    extrasPricing: params.extrasPricing,
    overheadPercentage: params.overheadPercentage,
    marginPercentage: params.marginPercentage,
  } as Json;
}

export function useProposals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: pricingParams = DEFAULT_PRICING_PARAMS } = usePricingParams(user?.id);

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals', user?.id, pricingParams],
    queryFn: async (): Promise<ProposalWithAuthor[]> => {
      if (!user) return [];
      
      // Fetch proposals
      const { data: proposalsData, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
        throw error;
      }

      // Get unique user IDs from proposals
      const userIds = [...new Set(proposalsData.map(p => p.user_id))];
      
      // Fetch profiles for all authors
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      // Transform database rows to Proposal objects with author info
      return proposalsData.map((row): ProposalWithAuthor => {
        const formData: ProposalFormData = {
          clientType: row.client_type as ClientType,
          clientName: row.client_name,
          clientEmail: row.client_email || undefined,
          clientPhone: row.client_phone || undefined,
          sector: row.sector,
          serviceType: row.service_type as ServiceType,
          estimatedDuration: row.duration_months,
          durationUnit: 'months', // Default to months for backwards compatibility
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

        // Use saved pricing params if available, otherwise use current params
        const savedPricingParams = row.pricing_params as unknown as SavedPricingParams | null;
        const paramsToUse = savedPricingParams 
          ? savedParamsToFull(savedPricingParams)
          : pricingParams;

        return {
          id: row.id,
          formData,
          pricing: calculatePricing(formData, paramsToUse),
          pricingParams: savedPricingParams || undefined,
          status: row.status as ProposalStatus,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          authorName: profilesMap.get(row.user_id) || 'Utilizador desconhecido',
          authorId: row.user_id,
          isOwner: row.user_id === user.id,
        };
      });
    },
    enabled: !!user,
  });

  const createProposal = useMutation({
    mutationFn: async (formData: ProposalFormData) => {
      if (!user) throw new Error('User not authenticated');

      // Ensure pricingParams is fully initialized with defaults
      const safeParams: PricingParams = {
        hourlyRates: pricingParams?.hourlyRates ?? DEFAULT_PRICING_PARAMS.hourlyRates,
        complexityMultipliers: pricingParams?.complexityMultipliers ?? DEFAULT_PRICING_PARAMS.complexityMultipliers,
        extrasPricing: pricingParams?.extrasPricing ?? DEFAULT_PRICING_PARAMS.extrasPricing,
        overheadPercentage: pricingParams?.overheadPercentage ?? DEFAULT_PRICING_PARAMS.overheadPercentage,
        marginPercentage: pricingParams?.marginPercentage ?? DEFAULT_PRICING_PARAMS.marginPercentage,
      };

      const pricing = calculatePricing(formData, safeParams);

      // Create pricing params snapshot to store with proposal
      const pricingParamsSnapshot: SavedPricingParams = {
        hourlyRates: safeParams.hourlyRates,
        complexityMultipliers: safeParams.complexityMultipliers,
        extrasPricing: safeParams.extrasPricing,
        overheadPercentage: safeParams.overheadPercentage,
        marginPercentage: safeParams.marginPercentage,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert([{
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
          pricing_params: pricingParamsToJson(pricingParamsSnapshot),
          // Event-specific fields
          event_type: formData.eventType || null,
          coverage_duration: formData.coverageDuration || null,
          event_date: formData.eventDate || null,
          event_days: formData.eventDays || null,
          event_staffing: formData.eventStaffing ? JSON.parse(JSON.stringify(formData.eventStaffing)) : null,
          event_extras: formData.eventExtras ? JSON.parse(JSON.stringify(formData.eventExtras)) : null,
          post_production_hours: formData.includesPostProduction ? 8 : 0,
          // Web/Systems-specific fields
          web_project_type: formData.webSystemsData?.projectType || null,
          number_of_pages: formData.webSystemsData?.numberOfPages || null,
          number_of_modules: formData.webSystemsData?.numberOfModules || null,
          has_payment_integration: formData.webSystemsData?.hasPaymentIntegration || false,
          has_crm_integration: formData.webSystemsData?.hasCrmIntegration || false,
          has_erp_integration: formData.webSystemsData?.hasErpIntegration || false,
          has_maintenance: formData.webSystemsData?.hasMaintenanceSupport || false,
          maintenance_months: formData.webSystemsData?.maintenanceMonths || null,
          // Design-specific fields
          number_of_concepts: formData.designData?.numberOfConcepts || null,
          number_of_revisions: formData.designData?.numberOfRevisions || null,
          deliverable_formats: formData.designData?.deliverableFormats || [],
          includes_brand_guidelines: formData.designData?.includesBrandGuidelines || false,
        }])
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

      // Ensure pricingParams is fully initialized with defaults
      const safeParams: PricingParams = {
        hourlyRates: pricingParams?.hourlyRates ?? DEFAULT_PRICING_PARAMS.hourlyRates,
        complexityMultipliers: pricingParams?.complexityMultipliers ?? DEFAULT_PRICING_PARAMS.complexityMultipliers,
        extrasPricing: pricingParams?.extrasPricing ?? DEFAULT_PRICING_PARAMS.extrasPricing,
        overheadPercentage: pricingParams?.overheadPercentage ?? DEFAULT_PRICING_PARAMS.overheadPercentage,
        marginPercentage: pricingParams?.marginPercentage ?? DEFAULT_PRICING_PARAMS.marginPercentage,
      };

      const pricing = calculatePricing(formData, safeParams);

      // Create pricing params snapshot for the duplicate
      const pricingParamsSnapshot: SavedPricingParams = {
        hourlyRates: safeParams.hourlyRates,
        complexityMultipliers: safeParams.complexityMultipliers,
        extrasPricing: safeParams.extrasPricing,
        overheadPercentage: safeParams.overheadPercentage,
        marginPercentage: safeParams.marginPercentage,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert([{
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
          pricing_params: pricingParamsToJson(pricingParamsSnapshot),
          // Event-specific fields
          event_type: formData.eventType || null,
          coverage_duration: formData.coverageDuration || null,
          event_date: formData.eventDate || null,
          event_days: formData.eventDays || null,
          event_staffing: formData.eventStaffing ? JSON.parse(JSON.stringify(formData.eventStaffing)) : null,
          event_extras: formData.eventExtras ? JSON.parse(JSON.stringify(formData.eventExtras)) : null,
          post_production_hours: formData.includesPostProduction ? 8 : 0,
          // Web/Systems-specific fields
          web_project_type: formData.webSystemsData?.projectType || null,
          number_of_pages: formData.webSystemsData?.numberOfPages || null,
          number_of_modules: formData.webSystemsData?.numberOfModules || null,
          has_payment_integration: formData.webSystemsData?.hasPaymentIntegration || false,
          has_crm_integration: formData.webSystemsData?.hasCrmIntegration || false,
          has_erp_integration: formData.webSystemsData?.hasErpIntegration || false,
          has_maintenance: formData.webSystemsData?.hasMaintenanceSupport || false,
          maintenance_months: formData.webSystemsData?.maintenanceMonths || null,
          // Design-specific fields
          number_of_concepts: formData.designData?.numberOfConcepts || null,
          number_of_revisions: formData.designData?.numberOfRevisions || null,
          deliverable_formats: formData.designData?.deliverableFormats || [],
          includes_brand_guidelines: formData.designData?.includesBrandGuidelines || false,
        }])
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

        // Ensure pricingParams is fully initialized with defaults for version history
        const safeParamsForVersion: PricingParams = {
          hourlyRates: pricingParams?.hourlyRates ?? DEFAULT_PRICING_PARAMS.hourlyRates,
          complexityMultipliers: pricingParams?.complexityMultipliers ?? DEFAULT_PRICING_PARAMS.complexityMultipliers,
          extrasPricing: pricingParams?.extrasPricing ?? DEFAULT_PRICING_PARAMS.extrasPricing,
          overheadPercentage: pricingParams?.overheadPercentage ?? DEFAULT_PRICING_PARAMS.overheadPercentage,
          marginPercentage: pricingParams?.marginPercentage ?? DEFAULT_PRICING_PARAMS.marginPercentage,
        };

        const currentPricing = calculatePricing(currentProposal.formData, safeParamsForVersion);

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
            // Event-specific fields
            event_type: currentProposal.formData.eventType || null,
            coverage_duration: currentProposal.formData.coverageDuration || null,
            event_date: currentProposal.formData.eventDate || null,
            event_days: currentProposal.formData.eventDays || null,
            event_staffing: currentProposal.formData.eventStaffing ? JSON.parse(JSON.stringify(currentProposal.formData.eventStaffing)) : null,
            event_extras: currentProposal.formData.eventExtras ? JSON.parse(JSON.stringify(currentProposal.formData.eventExtras)) : null,
            post_production_hours: currentProposal.formData.includesPostProduction ? 8 : 0,
            // Web/Systems-specific fields
            web_project_type: currentProposal.formData.webSystemsData?.projectType || null,
            number_of_pages: currentProposal.formData.webSystemsData?.numberOfPages || null,
            number_of_modules: currentProposal.formData.webSystemsData?.numberOfModules || null,
            has_payment_integration: currentProposal.formData.webSystemsData?.hasPaymentIntegration || false,
            has_crm_integration: currentProposal.formData.webSystemsData?.hasCrmIntegration || false,
            has_erp_integration: currentProposal.formData.webSystemsData?.hasErpIntegration || false,
            has_maintenance: currentProposal.formData.webSystemsData?.hasMaintenanceSupport || false,
            maintenance_months: currentProposal.formData.webSystemsData?.maintenanceMonths || null,
            // Design-specific fields
            number_of_concepts: currentProposal.formData.designData?.numberOfConcepts || null,
            number_of_revisions: currentProposal.formData.designData?.numberOfRevisions || null,
            deliverable_formats: currentProposal.formData.designData?.deliverableFormats || [],
            includes_brand_guidelines: currentProposal.formData.designData?.includesBrandGuidelines || false,
          });
      }

      // Ensure pricingParams is fully initialized with defaults for update
      const safeParams: PricingParams = {
        hourlyRates: pricingParams?.hourlyRates ?? DEFAULT_PRICING_PARAMS.hourlyRates,
        complexityMultipliers: pricingParams?.complexityMultipliers ?? DEFAULT_PRICING_PARAMS.complexityMultipliers,
        extrasPricing: pricingParams?.extrasPricing ?? DEFAULT_PRICING_PARAMS.extrasPricing,
        overheadPercentage: pricingParams?.overheadPercentage ?? DEFAULT_PRICING_PARAMS.overheadPercentage,
        marginPercentage: pricingParams?.marginPercentage ?? DEFAULT_PRICING_PARAMS.marginPercentage,
      };

      const pricing = calculatePricing(formData, safeParams);

      // Create pricing params snapshot for the update
      const pricingParamsSnapshot: SavedPricingParams = {
        hourlyRates: safeParams.hourlyRates,
        complexityMultipliers: safeParams.complexityMultipliers,
        extrasPricing: safeParams.extrasPricing,
        overheadPercentage: safeParams.overheadPercentage,
        marginPercentage: safeParams.marginPercentage,
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
          pricing_params: pricingParamsToJson(pricingParamsSnapshot),
          // Event-specific fields
          event_type: formData.eventType || null,
          coverage_duration: formData.coverageDuration || null,
          event_date: formData.eventDate || null,
          event_days: formData.eventDays || null,
          event_staffing: formData.eventStaffing ? JSON.parse(JSON.stringify(formData.eventStaffing)) : null,
          event_extras: formData.eventExtras ? JSON.parse(JSON.stringify(formData.eventExtras)) : null,
          post_production_hours: formData.includesPostProduction ? 8 : 0,
          // Web/Systems-specific fields
          web_project_type: formData.webSystemsData?.projectType || null,
          number_of_pages: formData.webSystemsData?.numberOfPages || null,
          number_of_modules: formData.webSystemsData?.numberOfModules || null,
          has_payment_integration: formData.webSystemsData?.hasPaymentIntegration || false,
          has_crm_integration: formData.webSystemsData?.hasCrmIntegration || false,
          has_erp_integration: formData.webSystemsData?.hasErpIntegration || false,
          has_maintenance: formData.webSystemsData?.hasMaintenanceSupport || false,
          maintenance_months: formData.webSystemsData?.maintenanceMonths || null,
          // Design-specific fields
          number_of_concepts: formData.designData?.numberOfConcepts || null,
          number_of_revisions: formData.designData?.numberOfRevisions || null,
          deliverable_formats: formData.designData?.deliverableFormats || [],
          includes_brand_guidelines: formData.designData?.includesBrandGuidelines || false,
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

  // Create proposal with multiple services
  const createMultiServiceProposal = useMutation({
    mutationFn: async ({
      clientData,
      services,
      locations,
    }: {
      clientData: {
        clientName: string;
        clientEmail?: string;
        clientPhone?: string;
        clientType: ClientType;
        sector: string;
      };
      services: ProposalService[];
      locations: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');
      if (services.length === 0) throw new Error('At least one service is required');

      // Ensure pricingParams is fully initialized with defaults
      const safeParams: PricingParams = {
        hourlyRates: pricingParams?.hourlyRates ?? DEFAULT_PRICING_PARAMS.hourlyRates,
        complexityMultipliers: pricingParams?.complexityMultipliers ?? DEFAULT_PRICING_PARAMS.complexityMultipliers,
        extrasPricing: pricingParams?.extrasPricing ?? DEFAULT_PRICING_PARAMS.extrasPricing,
        overheadPercentage: pricingParams?.overheadPercentage ?? DEFAULT_PRICING_PARAMS.overheadPercentage,
        marginPercentage: pricingParams?.marginPercentage ?? DEFAULT_PRICING_PARAMS.marginPercentage,
      };

      // Calculate pricing for all services
      const servicesWithPricing = updateServicesWithPricing(services, safeParams);
      const totalPricing = calculateMultiServicePricing(services, safeParams);

      // Use first service for main proposal fields (for backward compatibility)
      const mainService = servicesWithPricing[0];

      // Create pricing params snapshot to store with proposal
      const pricingParamsSnapshot: SavedPricingParams = {
        hourlyRates: safeParams.hourlyRates,
        complexityMultipliers: safeParams.complexityMultipliers,
        extrasPricing: safeParams.extrasPricing,
        overheadPercentage: safeParams.overheadPercentage,
        marginPercentage: safeParams.marginPercentage,
      };

      // Create the main proposal first
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .insert([{
          user_id: user.id,
          client_name: clientData.clientName,
          client_email: clientData.clientEmail || null,
          client_phone: clientData.clientPhone || null,
          client_type: clientData.clientType,
          sector: clientData.sector,
          service_type: mainService.serviceType,
          duration_months: mainService.estimatedDuration,
          locations: locations,
          complexity: mainService.complexity,
          maturity_level: 'medium',
          deliverables: mainService.deliverables,
          has_existing_team: false,
          methodology: 'hybrid',
          total_value: totalPricing.totalFinalPrice,
          status: 'draft',
          pricing_params: pricingParamsToJson(pricingParamsSnapshot),
          // Event-specific fields from main service
          event_type: mainService.eventType || null,
          coverage_duration: mainService.coverageDuration || null,
          event_date: mainService.eventDate || null,
          event_days: mainService.eventDays || null,
          event_staffing: mainService.eventStaffing ? JSON.parse(JSON.stringify(mainService.eventStaffing)) : null,
          event_extras: mainService.eventExtras ? JSON.parse(JSON.stringify(mainService.eventExtras)) : null,
          post_production_hours: mainService.postProductionHours || 0,
          // Web/Systems-specific fields
          web_project_type: mainService.webProjectType || null,
          number_of_pages: mainService.numberOfPages || null,
          number_of_modules: mainService.numberOfModules || null,
          has_payment_integration: mainService.hasPaymentIntegration || false,
          has_crm_integration: mainService.hasCrmIntegration || false,
          has_erp_integration: mainService.hasErpIntegration || false,
          has_maintenance: mainService.hasMaintenance || false,
          maintenance_months: mainService.maintenanceMonths || null,
          // Design-specific fields
          number_of_concepts: mainService.numberOfConcepts || null,
          number_of_revisions: mainService.numberOfRevisions || null,
          deliverable_formats: mainService.deliverableFormats || [],
          includes_brand_guidelines: mainService.includesBrandGuidelines || false,
        }])
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Insert all services into proposal_services table
      const serviceRows = servicesWithPricing.map((service, index) => ({
        proposal_id: proposalData.id,
        service_type: service.serviceType,
        complexity: service.complexity,
        estimated_duration: service.estimatedDuration,
        duration_unit: service.durationUnit,
        deliverables: service.deliverables,
        event_type: service.eventType || null,
        event_date: service.eventDate || null,
        event_days: service.eventDays || null,
        event_staffing: service.eventStaffing ? JSON.parse(JSON.stringify(service.eventStaffing)) : null,
        event_extras: service.eventExtras ? JSON.parse(JSON.stringify(service.eventExtras)) : null,
        coverage_duration: service.coverageDuration || null,
        post_production_hours: service.postProductionHours || null,
        web_project_type: service.webProjectType || null,
        number_of_pages: service.numberOfPages || null,
        number_of_modules: service.numberOfModules || null,
        has_payment_integration: service.hasPaymentIntegration || false,
        has_crm_integration: service.hasCrmIntegration || false,
        has_erp_integration: service.hasErpIntegration || false,
        has_maintenance: service.hasMaintenance || false,
        maintenance_months: service.maintenanceMonths || null,
        number_of_concepts: service.numberOfConcepts || null,
        number_of_revisions: service.numberOfRevisions || null,
        includes_brand_guidelines: service.includesBrandGuidelines || false,
        deliverable_formats: service.deliverableFormats || [],
        service_value: service.serviceValue || 0,
        display_order: index,
      }));

      const { error: servicesError } = await supabase
        .from('proposal_services')
        .insert(serviceRows);

      if (servicesError) {
        // If services insertion fails, delete the proposal to maintain consistency
        await supabase.from('proposals').delete().eq('id', proposalData.id);
        throw servicesError;
      }

      return proposalData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposta multi-serviços criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating multi-service proposal:', error);
      toast.error('Erro ao criar proposta multi-serviços');
    },
  });

  return {
    proposals,
    isLoading,
    createProposal,
    createMultiServiceProposal,
    updateProposal,
    updateProposalStatus,
    deleteProposal,
    duplicateProposal,
    getProposal,
  };
}
