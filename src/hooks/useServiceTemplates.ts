import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceTemplate, dbRowToTemplate, serviceToTemplateData } from '@/types/serviceTemplate';
import { ProposalService } from '@/types/proposalService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useServiceTemplates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['service-templates', user?.id],
    queryFn: async (): Promise<ServiceTemplate[]> => {
      const { data, error } = await supabase
        .from('service_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching service templates:', error);
        throw error;
      }

      return (data || []).map(dbRowToTemplate);
    },
    enabled: !!user,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async ({ 
      service, 
      name, 
      description 
    }: { 
      service: ProposalService; 
      name: string; 
      description: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const templateData = serviceToTemplateData(service, name, description, user.id);
      
      const insertData = {
        name: templateData.name,
        description: templateData.description,
        service_type: templateData.serviceType,
        complexity: templateData.complexity,
        estimated_duration: templateData.estimatedDuration,
        duration_unit: templateData.durationUnit,
        deliverables: templateData.deliverables,
        event_type: templateData.eventType || null,
        event_days: templateData.eventDays || null,
        event_staffing: templateData.eventStaffing || null,
        event_extras: templateData.eventExtras || null,
        coverage_duration: templateData.coverageDuration || null,
        post_production_hours: templateData.postProductionHours || null,
        web_project_type: templateData.webProjectType || null,
        number_of_pages: templateData.numberOfPages || null,
        number_of_modules: templateData.numberOfModules || null,
        has_payment_integration: templateData.hasPaymentIntegration || false,
        has_crm_integration: templateData.hasCrmIntegration || false,
        has_erp_integration: templateData.hasErpIntegration || false,
        has_maintenance: templateData.hasMaintenance || false,
        maintenance_months: templateData.maintenanceMonths || null,
        number_of_concepts: templateData.numberOfConcepts || null,
        number_of_revisions: templateData.numberOfRevisions || null,
        includes_brand_guidelines: templateData.includesBrandGuidelines || false,
        deliverable_formats: templateData.deliverableFormats || [],
        is_system_template: false,
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('service_templates')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return dbRowToTemplate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-templates'] });
      toast.success('Template guardado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Erro ao guardar template');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('service_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-templates'] });
      toast.success('Template eliminado com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Erro ao eliminar template');
    },
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error,
    createTemplate: createTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    deleteTemplate: deleteTemplateMutation.mutate,
    isDeleting: deleteTemplateMutation.isPending,
  };
}
