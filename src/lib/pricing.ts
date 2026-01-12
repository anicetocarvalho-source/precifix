import {
  ProposalFormData,
  PricingResult,
  TeamMember,
  HOURLY_RATES,
  COMPLEXITY_MULTIPLIERS,
  OVERHEAD_PERCENTAGE,
  MARGIN_PERCENTAGE,
} from '@/types/proposal';

export interface PricingParams {
  hourlyRates: {
    seniorManager: number;
    consultant: number;
    analyst: number;
    coordinator: number;
    trainer: number;
  };
  complexityMultipliers: {
    low: number;
    medium: number;
    high: number;
  };
  overheadPercentage: number;
  marginPercentage: number;
}

// Default pricing parameters (fallback when no custom params exist)
export const DEFAULT_PRICING_PARAMS: PricingParams = {
  hourlyRates: {
    seniorManager: HOURLY_RATES.seniorManager,
    consultant: HOURLY_RATES.consultant,
    analyst: HOURLY_RATES.analyst,
    coordinator: HOURLY_RATES.coordinator,
    trainer: HOURLY_RATES.trainer,
  },
  complexityMultipliers: {
    low: COMPLEXITY_MULTIPLIERS.low,
    medium: COMPLEXITY_MULTIPLIERS.medium,
    high: COMPLEXITY_MULTIPLIERS.high,
  },
  overheadPercentage: OVERHEAD_PERCENTAGE,
  marginPercentage: MARGIN_PERCENTAGE,
};

export function calculatePricing(formData: ProposalFormData, params?: PricingParams): PricingResult {
  const pricingParams = params || DEFAULT_PRICING_PARAMS;
  const teamMembers: TeamMember[] = [];
  const hoursPerMonth = 160; // Standard work month
  
  // Base team composition
  // Always include a Senior Manager
  teamMembers.push({
    role: 'Gestor Sénior',
    hourlyRate: pricingParams.hourlyRates.seniorManager,
    hoursPerMonth: formData.complexity === 'high' ? 80 : 40,
    dedication: formData.complexity === 'high' ? 50 : 25,
  });
  
  // Add consultants based on complexity
  const consultantCount = formData.complexity === 'high' ? 2 : 1;
  for (let i = 0; i < consultantCount; i++) {
    teamMembers.push({
      role: 'Consultor Pleno',
      hourlyRate: pricingParams.hourlyRates.consultant,
      hoursPerMonth: hoursPerMonth * 0.75,
      dedication: 75,
    });
  }
  
  // Add analyst
  teamMembers.push({
    role: 'Analista',
    hourlyRate: pricingParams.hourlyRates.analyst,
    hoursPerMonth: hoursPerMonth,
    dedication: 100,
  });
  
  // Add coordinator per location
  formData.locations.forEach((location, index) => {
    teamMembers.push({
      role: `Coordenador Local (${location || `Local ${index + 1}`})`,
      hourlyRate: pricingParams.hourlyRates.coordinator,
      hoursPerMonth: hoursPerMonth * 0.5,
      dedication: 50,
    });
  });
  
  // Add trainer if training is part of service
  if (formData.serviceType === 'training' || formData.deliverables.includes('training')) {
    teamMembers.push({
      role: 'Formador',
      hourlyRate: pricingParams.hourlyRates.trainer,
      hoursPerMonth: 40,
      dedication: 25,
    });
  }
  
  // Projects > 3 months require minimum 3 profiles
  if (formData.estimatedDuration > 3 && teamMembers.length < 3) {
    teamMembers.push({
      role: 'Consultor Adicional',
      hourlyRate: pricingParams.hourlyRates.consultant,
      hoursPerMonth: hoursPerMonth * 0.5,
      dedication: 50,
    });
  }
  
  // Calculate totals
  const totalHoursPerMonth = teamMembers.reduce((sum, m) => sum + m.hoursPerMonth, 0);
  const totalHours = totalHoursPerMonth * formData.estimatedDuration;
  
  const baseCost = teamMembers.reduce(
    (sum, m) => sum + m.hourlyRate * m.hoursPerMonth * formData.estimatedDuration,
    0
  );
  
  const complexityMultiplier = pricingParams.complexityMultipliers[formData.complexity];
  const costAfterComplexity = baseCost * complexityMultiplier;
  
  const overhead = costAfterComplexity * pricingParams.overheadPercentage;
  const costWithOverhead = costAfterComplexity + overhead;
  
  const margin = costWithOverhead * pricingParams.marginPercentage;
  const finalPrice = costWithOverhead + margin;
  
  return {
    teamMembers,
    totalHours,
    baseCost,
    complexityMultiplier,
    overhead,
    margin,
    finalPrice,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' Kz';
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
