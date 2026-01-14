import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProposalService } from '@/types/proposalService';
import { ServiceType, Complexity, DurationUnit } from '@/types/proposal';

// Convert database row to ProposalService
function dbRowToService(row: any): ProposalService {
  return {
    id: row.id,
    serviceType: row.service_type as ServiceType,
    complexity: row.complexity as Complexity,
    estimatedDuration: row.estimated_duration,
    durationUnit: row.duration_unit as DurationUnit,
    deliverables: row.deliverables || [],
    eventType: row.event_type || undefined,
    eventDate: row.event_date || undefined,
    eventDays: row.event_days || undefined,
    eventStaffing: row.event_staffing || undefined,
    eventExtras: row.event_extras || undefined,
    coverageDuration: row.coverage_duration || undefined,
    postProductionHours: row.post_production_hours || undefined,
    webProjectType: row.web_project_type || undefined,
    numberOfPages: row.number_of_pages || undefined,
    numberOfModules: row.number_of_modules || undefined,
    hasPaymentIntegration: row.has_payment_integration || false,
    hasCrmIntegration: row.has_crm_integration || false,
    hasErpIntegration: row.has_erp_integration || false,
    hasMaintenance: row.has_maintenance || false,
    maintenanceMonths: row.maintenance_months || undefined,
    numberOfConcepts: row.number_of_concepts || undefined,
    numberOfRevisions: row.number_of_revisions || undefined,
    includesBrandGuidelines: row.includes_brand_guidelines || false,
    deliverableFormats: row.deliverable_formats || [],
    serviceValue: Number(row.service_value) || 0,
    displayOrder: row.display_order || 0,
  };
}

export function useProposalServices(proposalId: string | undefined) {
  return useQuery({
    queryKey: ['proposal-services', proposalId],
    queryFn: async (): Promise<ProposalService[]> => {
      if (!proposalId) return [];

      const { data, error } = await supabase
        .from('proposal_services')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching proposal services:', error);
        throw error;
      }

      return (data || []).map(dbRowToService);
    },
    enabled: !!proposalId,
  });
}
