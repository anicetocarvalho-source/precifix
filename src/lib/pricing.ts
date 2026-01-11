import {
  ProposalFormData,
  PricingResult,
  TeamMember,
  HOURLY_RATES,
  COMPLEXITY_MULTIPLIERS,
  OVERHEAD_PERCENTAGE,
  MARGIN_PERCENTAGE,
} from '@/types/proposal';

export function calculatePricing(formData: ProposalFormData): PricingResult {
  const teamMembers: TeamMember[] = [];
  const hoursPerMonth = 160; // Standard work month
  
  // Base team composition
  // Always include a Senior Manager
  teamMembers.push({
    role: 'Gestor Sénior',
    hourlyRate: HOURLY_RATES.seniorManager,
    hoursPerMonth: formData.complexity === 'high' ? 80 : 40,
    dedication: formData.complexity === 'high' ? 50 : 25,
  });
  
  // Add consultants based on complexity
  const consultantCount = formData.complexity === 'high' ? 2 : 1;
  for (let i = 0; i < consultantCount; i++) {
    teamMembers.push({
      role: 'Consultor Pleno',
      hourlyRate: HOURLY_RATES.consultant,
      hoursPerMonth: hoursPerMonth * 0.75,
      dedication: 75,
    });
  }
  
  // Add analyst
  teamMembers.push({
    role: 'Analista',
    hourlyRate: HOURLY_RATES.analyst,
    hoursPerMonth: hoursPerMonth,
    dedication: 100,
  });
  
  // Add coordinator per location
  formData.locations.forEach((location, index) => {
    teamMembers.push({
      role: `Coordenador Local (${location || `Local ${index + 1}`})`,
      hourlyRate: HOURLY_RATES.coordinator,
      hoursPerMonth: hoursPerMonth * 0.5,
      dedication: 50,
    });
  });
  
  // Add trainer if training is part of service
  if (formData.serviceType === 'training' || formData.deliverables.includes('training')) {
    teamMembers.push({
      role: 'Formador',
      hourlyRate: HOURLY_RATES.trainer,
      hoursPerMonth: 40,
      dedication: 25,
    });
  }
  
  // Projects > 3 months require minimum 3 profiles
  if (formData.estimatedDuration > 3 && teamMembers.length < 3) {
    teamMembers.push({
      role: 'Consultor Adicional',
      hourlyRate: HOURLY_RATES.consultant,
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
  
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[formData.complexity];
  const costAfterComplexity = baseCost * complexityMultiplier;
  
  const overhead = costAfterComplexity * OVERHEAD_PERCENTAGE;
  const costWithOverhead = costAfterComplexity + overhead;
  
  const margin = costWithOverhead * MARGIN_PERCENTAGE;
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
