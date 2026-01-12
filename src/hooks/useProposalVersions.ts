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

  return {
    versions,
    isLoading,
    createVersion,
    getLatestVersion,
  };
}
