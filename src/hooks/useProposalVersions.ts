import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProposalFormData } from '@/types/proposal';
import { calculatePricing } from '@/lib/pricing';
import { toast } from 'sonner';

export interface ProposalVersion {
  id: string;
  proposal_id: string;
  version_number: number;
  client_name: string;
  client_type: string;
  sector: string;
  service_type: string;
  duration_months: number;
  locations: string[];
  complexity: string;
  maturity_level: string;
  deliverables: string[];
  has_existing_team: boolean;
  methodology: string;
  total_value: number;
  status: string;
  change_summary: string | null;
  created_at: string;
  created_by: string;
  // Event-specific fields
  event_type: string | null;
  coverage_duration: string | null;
  event_date: string | null;
  event_days: number | null;
  event_staffing: Record<string, number> | null;
  event_extras: Record<string, boolean> | null;
  post_production_hours: number | null;
  // Web/Systems-specific fields
  web_project_type: string | null;
  number_of_pages: number | null;
  number_of_modules: number | null;
  has_payment_integration: boolean;
  has_crm_integration: boolean;
  has_erp_integration: boolean;
  has_maintenance: boolean;
  maintenance_months: number | null;
  // Design-specific fields
  number_of_concepts: number | null;
  number_of_revisions: number | null;
  deliverable_formats: string[];
  includes_brand_guidelines: boolean;
}

export function useProposalVersions(proposalId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['proposal-versions', proposalId],
    queryFn: async () => {
      if (!proposalId) return [];

      const { data, error } = await supabase
        .from('proposal_versions')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Error fetching versions:', error);
        throw error;
      }

      return data as ProposalVersion[];
    },
    enabled: !!proposalId && !!user,
  });

  const createVersion = useMutation({
    mutationFn: async ({
      proposalId,
      formData,
      status,
      changeSummary,
    }: {
      proposalId: string;
      formData: ProposalFormData;
      status: string;
      changeSummary?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get the current max version number
      const { data: existingVersions } = await supabase
        .from('proposal_versions')
        .select('version_number')
        .eq('proposal_id', proposalId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersionNumber = existingVersions && existingVersions.length > 0
        ? existingVersions[0].version_number + 1
        : 1;

      const pricing = calculatePricing(formData);

      const { data, error } = await supabase
        .from('proposal_versions')
        .insert({
          proposal_id: proposalId,
          version_number: nextVersionNumber,
          client_name: formData.clientName,
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
          status,
          change_summary: changeSummary || null,
          created_by: user.id,
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
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-versions', proposalId] });
    },
    onError: (error) => {
      console.error('Error creating version:', error);
      toast.error('Erro ao guardar versão');
    },
  });

  const getLatestVersion = () => {
    return versions.length > 0 ? versions[0] : null;
  };

  const restoreVersion = useMutation({
    mutationFn: async (version: ProposalVersion) => {
      if (!user) throw new Error('User not authenticated');

      // Update the main proposal with the version data
      const { error } = await supabase
        .from('proposals')
        .update({
          client_name: version.client_name,
          client_type: version.client_type,
          sector: version.sector,
          service_type: version.service_type,
          duration_months: version.duration_months,
          locations: version.locations,
          complexity: version.complexity,
          maturity_level: version.maturity_level,
          deliverables: version.deliverables,
          has_existing_team: version.has_existing_team,
          methodology: version.methodology,
          total_value: version.total_value,
          status: version.status,
        })
        .eq('id', version.proposal_id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Create a new version entry to record the restoration
      const nextVersionNumber = versions.length > 0 ? versions[0].version_number + 1 : 1;

      await supabase
        .from('proposal_versions')
        .insert({
          proposal_id: version.proposal_id,
          version_number: nextVersionNumber,
          client_name: version.client_name,
          client_type: version.client_type,
          sector: version.sector,
          service_type: version.service_type,
          duration_months: version.duration_months,
          locations: version.locations,
          complexity: version.complexity,
          maturity_level: version.maturity_level,
          deliverables: version.deliverables,
          has_existing_team: version.has_existing_team,
          methodology: version.methodology,
          total_value: version.total_value,
          status: version.status,
          change_summary: `Restaurado para versão ${version.version_number}`,
          created_by: user.id,
          // Event-specific fields
          event_type: version.event_type || null,
          coverage_duration: version.coverage_duration || null,
          event_date: version.event_date || null,
          event_days: version.event_days || null,
          event_staffing: version.event_staffing || null,
          event_extras: version.event_extras || null,
          post_production_hours: version.post_production_hours || 0,
          // Web/Systems-specific fields
          web_project_type: version.web_project_type || null,
          number_of_pages: version.number_of_pages || null,
          number_of_modules: version.number_of_modules || null,
          has_payment_integration: version.has_payment_integration || false,
          has_crm_integration: version.has_crm_integration || false,
          has_erp_integration: version.has_erp_integration || false,
          has_maintenance: version.has_maintenance || false,
          maintenance_months: version.maintenance_months || null,
          // Design-specific fields
          number_of_concepts: version.number_of_concepts || null,
          number_of_revisions: version.number_of_revisions || null,
          deliverable_formats: version.deliverable_formats || [],
          includes_brand_guidelines: version.includes_brand_guidelines || false,
        });

      return version;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-versions', proposalId] });
      toast.success('Proposta restaurada com sucesso');
    },
    onError: (error) => {
      console.error('Error restoring version:', error);
      toast.error('Erro ao restaurar versão');
    },
  });

  return {
    versions,
    isLoading,
    createVersion,
    getLatestVersion,
    restoreVersion,
  };
}
