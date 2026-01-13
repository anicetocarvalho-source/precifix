import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  HOURLY_RATES, 
  CREATIVE_HOURLY_RATES, 
  EXTRAS_PRICING,
  COMPLEXITY_MULTIPLIERS,
  OVERHEAD_PERCENTAGE,
  MARGIN_PERCENTAGE 
} from '@/types/proposal';

export interface PricingParameters {
  id: string;
  userId: string;
  // Consulting hourly rates
  rateSeniorManager: number;
  rateConsultant: number;
  rateAnalyst: number;
  rateCoordinator: number;
  rateTrainer: number;
  // Creative hourly rates
  rateVideographer: number;
  ratePhotographer: number;
  rateVideoEditor: number;
  rateGraphicDesigner: number;
  rateWebDeveloper: number;
  rateSoundTechnician: number;
  rateLightingTechnician: number;
  // Complexity multipliers
  multiplierLow: number;
  multiplierMedium: number;
  multiplierHigh: number;
  // Extras pricing
  extrasDrone: number;
  extrasMulticamStreaming: number;
  extrasAdvancedLedLighting: number;
  extrasSlider: number;
  extrasCrane: number;
  extrasAerialCrane: number;
  // Percentages
  overheadPercentage: number;
  marginPercentage: number;
}

// Default values matching the original constants
export const DEFAULT_PRICING_PARAMETERS: Omit<PricingParameters, 'id' | 'userId'> = {
  // Consulting rates
  rateSeniorManager: HOURLY_RATES.seniorManager,
  rateConsultant: HOURLY_RATES.consultant,
  rateAnalyst: HOURLY_RATES.analyst,
  rateCoordinator: HOURLY_RATES.coordinator,
  rateTrainer: HOURLY_RATES.trainer,
  // Creative rates
  rateVideographer: CREATIVE_HOURLY_RATES.videographer,
  ratePhotographer: CREATIVE_HOURLY_RATES.photographer,
  rateVideoEditor: CREATIVE_HOURLY_RATES.videoEditor,
  rateGraphicDesigner: CREATIVE_HOURLY_RATES.graphicDesigner,
  rateWebDeveloper: CREATIVE_HOURLY_RATES.webDeveloper,
  rateSoundTechnician: CREATIVE_HOURLY_RATES.soundTechnician,
  rateLightingTechnician: CREATIVE_HOURLY_RATES.lightingTechnician,
  // Complexity multipliers
  multiplierLow: COMPLEXITY_MULTIPLIERS.low,
  multiplierMedium: COMPLEXITY_MULTIPLIERS.medium,
  multiplierHigh: COMPLEXITY_MULTIPLIERS.high,
  // Extras
  extrasDrone: EXTRAS_PRICING.drone,
  extrasMulticamStreaming: EXTRAS_PRICING.multicamStreaming,
  extrasAdvancedLedLighting: EXTRAS_PRICING.advancedLedLighting,
  extrasSlider: EXTRAS_PRICING.slider,
  extrasCrane: EXTRAS_PRICING.crane,
  extrasAerialCrane: EXTRAS_PRICING.aerialCrane,
  // Percentages
  overheadPercentage: OVERHEAD_PERCENTAGE,
  marginPercentage: MARGIN_PERCENTAGE,
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

      // Map database values to interface - use defaults for new fields not in DB
      return {
        id: data.id,
        userId: data.user_id,
        rateSeniorManager: Number(data.rate_senior_manager),
        rateConsultant: Number(data.rate_consultant),
        rateAnalyst: Number(data.rate_analyst),
        rateCoordinator: Number(data.rate_coordinator),
        rateTrainer: Number(data.rate_trainer),
        // Creative rates - use defaults since not in DB yet
        rateVideographer: DEFAULT_PRICING_PARAMETERS.rateVideographer,
        ratePhotographer: DEFAULT_PRICING_PARAMETERS.ratePhotographer,
        rateVideoEditor: DEFAULT_PRICING_PARAMETERS.rateVideoEditor,
        rateGraphicDesigner: DEFAULT_PRICING_PARAMETERS.rateGraphicDesigner,
        rateWebDeveloper: DEFAULT_PRICING_PARAMETERS.rateWebDeveloper,
        rateSoundTechnician: DEFAULT_PRICING_PARAMETERS.rateSoundTechnician,
        rateLightingTechnician: DEFAULT_PRICING_PARAMETERS.rateLightingTechnician,
        // Multipliers
        multiplierLow: Number(data.multiplier_low),
        multiplierMedium: Number(data.multiplier_medium),
        multiplierHigh: Number(data.multiplier_high),
        // Extras - use defaults since not in DB yet
        extrasDrone: DEFAULT_PRICING_PARAMETERS.extrasDrone,
        extrasMulticamStreaming: DEFAULT_PRICING_PARAMETERS.extrasMulticamStreaming,
        extrasAdvancedLedLighting: DEFAULT_PRICING_PARAMETERS.extrasAdvancedLedLighting,
        extrasSlider: DEFAULT_PRICING_PARAMETERS.extrasSlider,
        extrasCrane: DEFAULT_PRICING_PARAMETERS.extrasCrane,
        extrasAerialCrane: DEFAULT_PRICING_PARAMETERS.extrasAerialCrane,
        // Percentages
        overheadPercentage: Number(data.overhead_percentage),
        marginPercentage: Number(data.margin_percentage),
      } as PricingParameters;
    },
    enabled: !!user?.id,
  });

  const saveParameters = useMutation({
    mutationFn: async (params: Omit<PricingParameters, 'id' | 'userId'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Only save fields that exist in the database
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

// Helper function to convert PricingParameters to PricingParams for calculations
export function toPricingParams(params: PricingParameters) {
  return {
    hourlyRates: {
      seniorManager: params.rateSeniorManager,
      consultant: params.rateConsultant,
      analyst: params.rateAnalyst,
      coordinator: params.rateCoordinator,
      trainer: params.rateTrainer,
      videographer: params.rateVideographer,
      photographer: params.ratePhotographer,
      videoEditor: params.rateVideoEditor,
      graphicDesigner: params.rateGraphicDesigner,
      webDeveloper: params.rateWebDeveloper,
      soundTechnician: params.rateSoundTechnician,
      lightingTechnician: params.rateLightingTechnician,
    },
    complexityMultipliers: {
      low: params.multiplierLow,
      medium: params.multiplierMedium,
      high: params.multiplierHigh,
    },
    extrasPricing: {
      drone: params.extrasDrone,
      multicamStreaming: params.extrasMulticamStreaming,
      advancedLedLighting: params.extrasAdvancedLedLighting,
      slider: params.extrasSlider,
      crane: params.extrasCrane,
      aerialCrane: params.extrasAerialCrane,
    },
    overheadPercentage: params.overheadPercentage,
    marginPercentage: params.marginPercentage,
  };
}
