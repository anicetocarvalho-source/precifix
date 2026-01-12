import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PricingParameters {
  id: string;
  userId: string;
  // Hourly rates
  rateSeniorManager: number;
  rateConsultant: number;
  rateAnalyst: number;
  rateCoordinator: number;
  rateTrainer: number;
  // Complexity multipliers
  multiplierLow: number;
  multiplierMedium: number;
  multiplierHigh: number;
  // Percentages
  overheadPercentage: number;
  marginPercentage: number;
}

// Default values matching the original constants
export const DEFAULT_PRICING_PARAMETERS: Omit<PricingParameters, 'id' | 'userId'> = {
  rateSeniorManager: 100000,
  rateConsultant: 75000,
  rateAnalyst: 45000,
  rateCoordinator: 60000,
  rateTrainer: 50000,
  multiplierLow: 1,
  multiplierMedium: 1.2,
  multiplierHigh: 1.5,
  overheadPercentage: 0.15,
  marginPercentage: 0.25,
};

export function usePricingParameters() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: parameters, isLoading } = useQuery({
    queryKey: ['pricing-parameters', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('pricing_parameters')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Return defaults if no custom parameters exist
        return {
          ...DEFAULT_PRICING_PARAMETERS,
          id: '',
          userId: user.id,
        } as PricingParameters;
      }

      return {
        id: data.id,
        userId: data.user_id,
        rateSeniorManager: Number(data.rate_senior_manager),
        rateConsultant: Number(data.rate_consultant),
        rateAnalyst: Number(data.rate_analyst),
        rateCoordinator: Number(data.rate_coordinator),
        rateTrainer: Number(data.rate_trainer),
        multiplierLow: Number(data.multiplier_low),
        multiplierMedium: Number(data.multiplier_medium),
        multiplierHigh: Number(data.multiplier_high),
        overheadPercentage: Number(data.overhead_percentage),
        marginPercentage: Number(data.margin_percentage),
      } as PricingParameters;
    },
    enabled: !!user?.id,
  });

  const saveParameters = useMutation({
    mutationFn: async (params: Omit<PricingParameters, 'id' | 'userId'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const dbParams = {
        user_id: user.id,
        rate_senior_manager: params.rateSeniorManager,
        rate_consultant: params.rateConsultant,
        rate_analyst: params.rateAnalyst,
        rate_coordinator: params.rateCoordinator,
        rate_trainer: params.rateTrainer,
        multiplier_low: params.multiplierLow,
        multiplier_medium: params.multiplierMedium,
        multiplier_high: params.multiplierHigh,
        overhead_percentage: params.overheadPercentage,
        margin_percentage: params.marginPercentage,
      };

      const { data: existing } = await supabase
        .from('pricing_parameters')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('pricing_parameters')
          .update(dbParams)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pricing_parameters')
          .insert(dbParams);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-parameters'] });
      toast({
        title: 'Parâmetros guardados',
        description: 'Os parâmetros de precificação foram actualizados com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao guardar',
        description: 'Não foi possível guardar os parâmetros.',
        variant: 'destructive',
      });
      console.error('Error saving pricing parameters:', error);
    },
  });

  const resetToDefaults = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('pricing_parameters')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-parameters'] });
      toast({
        title: 'Parâmetros restaurados',
        description: 'Os parâmetros foram restaurados para os valores padrão.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao restaurar',
        description: 'Não foi possível restaurar os parâmetros.',
        variant: 'destructive',
      });
      console.error('Error resetting pricing parameters:', error);
    },
  });

  return {
    parameters: parameters || { ...DEFAULT_PRICING_PARAMETERS, id: '', userId: '' },
    isLoading,
    saveParameters,
    resetToDefaults,
  };
}
