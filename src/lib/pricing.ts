import {
  ProposalFormData,
  PricingResult,
  TeamMember,
  ExtraItem,
  HOURLY_RATES,
  CREATIVE_HOURLY_RATES,
  EXTRAS_PRICING,
  COMPLEXITY_MULTIPLIERS,
  OVERHEAD_PERCENTAGE,
  MARGIN_PERCENTAGE,
  SERVICE_CATEGORIES,
} from '@/types/proposal';

export interface PricingParams {
  hourlyRates: {
    seniorManager: number;
    consultant: number;
    analyst: number;
    coordinator: number;
    trainer: number;
    videographer: number;
    photographer: number;
    videoEditor: number;
    graphicDesigner: number;
    webDeveloper: number;
    soundTechnician: number;
    lightingTechnician: number;
  };
  complexityMultipliers: {
    low: number;
    medium: number;
    high: number;
  };
  extrasPricing: {
    drone: number;
    multicamStreaming: number;
    advancedLedLighting: number;
    slider: number;
    crane: number;
    aerialCrane: number;
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
    videographer: CREATIVE_HOURLY_RATES.videographer,
    photographer: CREATIVE_HOURLY_RATES.photographer,
    videoEditor: CREATIVE_HOURLY_RATES.videoEditor,
    graphicDesigner: CREATIVE_HOURLY_RATES.graphicDesigner,
    webDeveloper: CREATIVE_HOURLY_RATES.webDeveloper,
    soundTechnician: CREATIVE_HOURLY_RATES.soundTechnician,
    lightingTechnician: CREATIVE_HOURLY_RATES.lightingTechnician,
  },
  complexityMultipliers: {
    low: COMPLEXITY_MULTIPLIERS.low,
    medium: COMPLEXITY_MULTIPLIERS.medium,
    high: COMPLEXITY_MULTIPLIERS.high,
  },
  extrasPricing: {
    drone: EXTRAS_PRICING.drone,
    multicamStreaming: EXTRAS_PRICING.multicamStreaming,
    advancedLedLighting: EXTRAS_PRICING.advancedLedLighting,
    slider: EXTRAS_PRICING.slider,
    crane: EXTRAS_PRICING.crane,
    aerialCrane: EXTRAS_PRICING.aerialCrane,
  },
  overheadPercentage: OVERHEAD_PERCENTAGE,
  marginPercentage: MARGIN_PERCENTAGE,
};

// Calculate pricing for consulting/PMO services
function calculateConsultingPricing(formData: ProposalFormData, params: PricingParams): { teamMembers: TeamMember[], totalHours: number, baseCost: number } {
  const teamMembers: TeamMember[] = [];
  const hoursPerMonth = 160;
  
  // Always include a Senior Manager
  teamMembers.push({
    role: 'Gestor Sénior',
    hourlyRate: params.hourlyRates.seniorManager,
    hoursPerMonth: formData.complexity === 'high' ? 80 : 40,
    dedication: formData.complexity === 'high' ? 50 : 25,
  });
  
  // Add consultants based on complexity
  const consultantCount = formData.complexity === 'high' ? 2 : 1;
  for (let i = 0; i < consultantCount; i++) {
    teamMembers.push({
      role: 'Consultor Pleno',
      hourlyRate: params.hourlyRates.consultant,
      hoursPerMonth: hoursPerMonth * 0.75,
      dedication: 75,
    });
  }
  
  // Add analyst
  teamMembers.push({
    role: 'Analista',
    hourlyRate: params.hourlyRates.analyst,
    hoursPerMonth: hoursPerMonth,
    dedication: 100,
  });
  
  // Add coordinator per location
  formData.locations.forEach((location, index) => {
    teamMembers.push({
      role: `Coordenador Local (${location || `Local ${index + 1}`})`,
      hourlyRate: params.hourlyRates.coordinator,
      hoursPerMonth: hoursPerMonth * 0.5,
      dedication: 50,
    });
  });
  
  // Add trainer if training is part of service
  if (formData.serviceType === 'training' || formData.deliverables.includes('training')) {
    teamMembers.push({
      role: 'Formador',
      hourlyRate: params.hourlyRates.trainer,
      hoursPerMonth: 40,
      dedication: 25,
    });
  }
  
  // Projects > 3 months require minimum 3 profiles
  if (formData.estimatedDuration > 3 && teamMembers.length < 3) {
    teamMembers.push({
      role: 'Consultor Adicional',
      hourlyRate: params.hourlyRates.consultant,
      hoursPerMonth: hoursPerMonth * 0.5,
      dedication: 50,
    });
  }
  
  const totalHoursPerMonth = teamMembers.reduce((sum, m) => sum + m.hoursPerMonth, 0);
  const totalHours = totalHoursPerMonth * formData.estimatedDuration;
  
  const baseCost = teamMembers.reduce(
    (sum, m) => sum + m.hourlyRate * m.hoursPerMonth * formData.estimatedDuration,
    0
  );
  
  return { teamMembers, totalHours, baseCost };
}

// Calculate pricing for event services (photography, video, streaming)
function calculateEventPricing(formData: ProposalFormData, params: PricingParams): { teamMembers: TeamMember[], extras: ExtraItem[], totalHours: number, baseCost: number, extrasTotal: number } {
  const teamMembers: TeamMember[] = [];
  const extras: ExtraItem[] = [];
  
  // Calculate event hours based on duration
  let eventHours = 8; // default full day
  if (formData.coverageDuration === 'half_day') {
    eventHours = 4;
  } else if (formData.coverageDuration === 'multi_day') {
    eventHours = 8 * (formData.eventDays || 2);
  }
  
  const staffing = formData.eventStaffing || {};
  
  // Add photographers
  if (staffing.photographers && staffing.photographers > 0) {
    teamMembers.push({
      role: `Fotógrafo${staffing.photographers > 1 ? 's' : ''} (${staffing.photographers})`,
      hourlyRate: params.hourlyRates.photographer,
      hoursPerMonth: eventHours * staffing.photographers,
      dedication: 100,
    });
  }
  
  // Add videographers
  if (staffing.videographers && staffing.videographers > 0) {
    teamMembers.push({
      role: `Videógrafo${staffing.videographers > 1 ? 's' : ''} (${staffing.videographers})`,
      hourlyRate: params.hourlyRates.videographer,
      hoursPerMonth: eventHours * staffing.videographers,
      dedication: 100,
    });
  }
  
  // Add operators
  if (staffing.operators && staffing.operators > 0) {
    teamMembers.push({
      role: `Operador${staffing.operators > 1 ? 'es' : ''} (${staffing.operators})`,
      hourlyRate: params.hourlyRates.videographer * 0.8,
      hoursPerMonth: eventHours * staffing.operators,
      dedication: 100,
    });
  }
  
  // Add sound technicians
  if (staffing.soundTechnicians && staffing.soundTechnicians > 0) {
    teamMembers.push({
      role: `Técnico${staffing.soundTechnicians > 1 ? 's' : ''} de Som (${staffing.soundTechnicians})`,
      hourlyRate: params.hourlyRates.soundTechnician,
      hoursPerMonth: eventHours * staffing.soundTechnicians,
      dedication: 100,
    });
  }
  
  // Add lighting technicians
  if (staffing.lightingTechnicians && staffing.lightingTechnicians > 0) {
    teamMembers.push({
      role: `Técnico${staffing.lightingTechnicians > 1 ? 's' : ''} de Iluminação (${staffing.lightingTechnicians})`,
      hourlyRate: params.hourlyRates.lightingTechnician,
      hoursPerMonth: eventHours * staffing.lightingTechnicians,
      dedication: 100,
    });
  }
  
  // Add editors for post-production
  if (formData.includesPostProduction || (staffing.editors && staffing.editors > 0)) {
    const editorCount = staffing.editors || 1;
    const editingHours = eventHours * 2 * editorCount; // 2x event duration for editing
    teamMembers.push({
      role: `Editor${editorCount > 1 ? 'es' : ''} de Vídeo (${editorCount})`,
      hourlyRate: params.hourlyRates.videoEditor,
      hoursPerMonth: editingHours,
      dedication: 100,
    });
  }
  
  // Add extras
  const eventExtras = formData.eventExtras || {};
  
  if (eventExtras.drone) {
    extras.push({
      name: 'Drone (cobertura aérea)',
      unitPrice: params.extrasPricing.drone,
      quantity: 1,
      total: params.extrasPricing.drone,
    });
  }
  
  if (eventExtras.multicamStreaming) {
    extras.push({
      name: 'Streaming multi-câmara',
      unitPrice: params.extrasPricing.multicamStreaming,
      quantity: 1,
      total: params.extrasPricing.multicamStreaming,
    });
  }
  
  if (eventExtras.advancedLedLighting) {
    extras.push({
      name: 'Iluminação LED avançada',
      unitPrice: params.extrasPricing.advancedLedLighting,
      quantity: 1,
      total: params.extrasPricing.advancedLedLighting,
    });
  }
  
  if (eventExtras.slider) {
    extras.push({
      name: 'Slider de câmara',
      unitPrice: params.extrasPricing.slider,
      quantity: 1,
      total: params.extrasPricing.slider,
    });
  }
  
  if (eventExtras.crane) {
    extras.push({
      name: 'Grua de câmara',
      unitPrice: params.extrasPricing.crane,
      quantity: 1,
      total: params.extrasPricing.crane,
    });
  }
  
  if (eventExtras.aerialCrane) {
    extras.push({
      name: 'Grua aérea',
      unitPrice: params.extrasPricing.aerialCrane,
      quantity: 1,
      total: params.extrasPricing.aerialCrane,
    });
  }
  
  const totalHours = teamMembers.reduce((sum, m) => sum + m.hoursPerMonth, 0);
  const baseCost = teamMembers.reduce((sum, m) => sum + m.hourlyRate * m.hoursPerMonth, 0);
  const extrasTotal = extras.reduce((sum, e) => sum + e.total, 0);
  
  return { teamMembers, extras, totalHours, baseCost, extrasTotal };
}

// Calculate pricing for creative services (design, branding, marketing)
function calculateCreativePricing(formData: ProposalFormData, params: PricingParams): { teamMembers: TeamMember[], totalHours: number, baseCost: number } {
  const teamMembers: TeamMember[] = [];
  const hoursPerMonth = 160;
  
  switch (formData.serviceType) {
    case 'graphic_design':
    case 'branding':
      // Design team
      teamMembers.push({
        role: 'Designer Gráfico Sénior',
        hourlyRate: params.hourlyRates.graphicDesigner * 1.3,
        hoursPerMonth: formData.complexity === 'high' ? hoursPerMonth : hoursPerMonth * 0.75,
        dedication: formData.complexity === 'high' ? 100 : 75,
      });
      
      if (formData.complexity !== 'low') {
        teamMembers.push({
          role: 'Designer Gráfico Júnior',
          hourlyRate: params.hourlyRates.graphicDesigner * 0.7,
          hoursPerMonth: hoursPerMonth * 0.5,
          dedication: 50,
        });
      }
      break;
      
    case 'marketing_digital':
      // Marketing team
      teamMembers.push({
        role: 'Gestor de Marketing Digital',
        hourlyRate: params.hourlyRates.consultant,
        hoursPerMonth: hoursPerMonth * 0.5,
        dedication: 50,
      });
      
      teamMembers.push({
        role: 'Especialista em Social Media',
        hourlyRate: params.hourlyRates.analyst,
        hoursPerMonth: hoursPerMonth * 0.75,
        dedication: 75,
      });
      
      if (formData.complexity !== 'low') {
        teamMembers.push({
          role: 'Designer de Conteúdo',
          hourlyRate: params.hourlyRates.graphicDesigner,
          hoursPerMonth: hoursPerMonth * 0.5,
          dedication: 50,
        });
      }
      break;
      
    case 'video_editing':
      // Video editing team
      teamMembers.push({
        role: 'Editor de Vídeo Sénior',
        hourlyRate: params.hourlyRates.videoEditor * 1.2,
        hoursPerMonth: hoursPerMonth * 0.75,
        dedication: 75,
      });
      
      if (formData.complexity !== 'low') {
        teamMembers.push({
          role: 'Motion Designer',
          hourlyRate: params.hourlyRates.videoEditor,
          hoursPerMonth: hoursPerMonth * 0.5,
          dedication: 50,
        });
      }
      break;
      
    default:
      // Generic creative team
      teamMembers.push({
        role: 'Director Criativo',
        hourlyRate: params.hourlyRates.seniorManager,
        hoursPerMonth: 40,
        dedication: 25,
      });
      
      teamMembers.push({
        role: 'Designer',
        hourlyRate: params.hourlyRates.graphicDesigner,
        hoursPerMonth: hoursPerMonth * 0.75,
        dedication: 75,
      });
  }
  
  const totalHoursPerMonth = teamMembers.reduce((sum, m) => sum + m.hoursPerMonth, 0);
  const totalHours = totalHoursPerMonth * formData.estimatedDuration;
  
  const baseCost = teamMembers.reduce(
    (sum, m) => sum + m.hourlyRate * m.hoursPerMonth * formData.estimatedDuration,
    0
  );
  
  return { teamMembers, totalHours, baseCost };
}

// Calculate pricing for technology services (web, systems)
function calculateTechnologyPricing(formData: ProposalFormData, params: PricingParams): { teamMembers: TeamMember[], totalHours: number, baseCost: number } {
  const teamMembers: TeamMember[] = [];
  const hoursPerMonth = 160;
  
  const webData = formData.webSystemsData || {};
  
  // Project lead
  teamMembers.push({
    role: 'Tech Lead / Gestor de Projecto',
    hourlyRate: params.hourlyRates.seniorManager,
    hoursPerMonth: formData.complexity === 'high' ? 80 : 40,
    dedication: formData.complexity === 'high' ? 50 : 25,
  });
  
  // Developers based on project type and complexity
  const devCount = formData.complexity === 'high' ? 3 : formData.complexity === 'medium' ? 2 : 1;
  
  for (let i = 0; i < devCount; i++) {
    const isSenior = i === 0;
    teamMembers.push({
      role: isSenior ? 'Desenvolvedor Full-Stack Sénior' : 'Desenvolvedor Full-Stack',
      hourlyRate: isSenior ? params.hourlyRates.webDeveloper * 1.3 : params.hourlyRates.webDeveloper,
      hoursPerMonth: hoursPerMonth,
      dedication: 100,
    });
  }
  
  // Add designer for web projects
  if (formData.serviceType === 'web_development') {
    teamMembers.push({
      role: 'UI/UX Designer',
      hourlyRate: params.hourlyRates.graphicDesigner * 1.2,
      hoursPerMonth: hoursPerMonth * 0.5,
      dedication: 50,
    });
  }
  
  // Add QA for complex projects
  if (formData.complexity !== 'low') {
    teamMembers.push({
      role: 'QA / Tester',
      hourlyRate: params.hourlyRates.analyst,
      hoursPerMonth: hoursPerMonth * 0.5,
      dedication: 50,
    });
  }
  
  // Add DevOps for systems
  if (formData.serviceType === 'systems_development') {
    teamMembers.push({
      role: 'DevOps Engineer',
      hourlyRate: params.hourlyRates.webDeveloper * 1.1,
      hoursPerMonth: hoursPerMonth * 0.25,
      dedication: 25,
    });
  }
  
  // Maintenance support
  if (webData.hasMaintenanceSupport && webData.maintenanceMonths) {
    teamMembers.push({
      role: 'Suporte e Manutenção',
      hourlyRate: params.hourlyRates.webDeveloper * 0.5,
      hoursPerMonth: 20,
      dedication: 12.5,
    });
  }
  
  const totalHoursPerMonth = teamMembers.reduce((sum, m) => sum + m.hoursPerMonth, 0);
  const totalHours = totalHoursPerMonth * formData.estimatedDuration;
  
  const baseCost = teamMembers.reduce(
    (sum, m) => sum + m.hourlyRate * m.hoursPerMonth * formData.estimatedDuration,
    0
  );
  
  return { teamMembers, totalHours, baseCost };
}

export function calculatePricing(formData: ProposalFormData, params?: PricingParams): PricingResult {
  const pricingParams = params || DEFAULT_PRICING_PARAMS;
  
  // Determine service category
  const category = SERVICE_CATEGORIES[formData.serviceType] || 'consulting';
  
  let teamMembers: TeamMember[] = [];
  let totalHours = 0;
  let baseCost = 0;
  let extras: ExtraItem[] = [];
  let extrasTotal = 0;
  
  switch (category) {
    case 'events':
      const eventResult = calculateEventPricing(formData, pricingParams);
      teamMembers = eventResult.teamMembers;
      totalHours = eventResult.totalHours;
      baseCost = eventResult.baseCost;
      extras = eventResult.extras;
      extrasTotal = eventResult.extrasTotal;
      break;
      
    case 'creative':
      const creativeResult = calculateCreativePricing(formData, pricingParams);
      teamMembers = creativeResult.teamMembers;
      totalHours = creativeResult.totalHours;
      baseCost = creativeResult.baseCost;
      break;
      
    case 'technology':
      const techResult = calculateTechnologyPricing(formData, pricingParams);
      teamMembers = techResult.teamMembers;
      totalHours = techResult.totalHours;
      baseCost = techResult.baseCost;
      break;
      
    case 'consulting':
    default:
      const consultingResult = calculateConsultingPricing(formData, pricingParams);
      teamMembers = consultingResult.teamMembers;
      totalHours = consultingResult.totalHours;
      baseCost = consultingResult.baseCost;
      break;
  }
  
  // Apply complexity multiplier
  const complexityMultiplier = pricingParams.complexityMultipliers[formData.complexity];
  const costAfterComplexity = baseCost * complexityMultiplier;
  
  // Add extras to cost
  const totalBeforeOverhead = costAfterComplexity + extrasTotal;
  
  // Apply overhead
  const overhead = totalBeforeOverhead * pricingParams.overheadPercentage;
  const costWithOverhead = totalBeforeOverhead + overhead;
  
  // Apply margin
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
    extras: extras.length > 0 ? extras : undefined,
    extrasTotal: extrasTotal > 0 ? extrasTotal : undefined,
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
