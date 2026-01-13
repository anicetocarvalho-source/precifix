// Pricing calculations for multiple services
import { ProposalService } from '@/types/proposalService';
import { 
  ProposalFormData, 
  PricingResult, 
  ServiceType, 
  Complexity,
  SERVICE_CATEGORIES 
} from '@/types/proposal';
import { calculatePricing, PricingParams, DEFAULT_PRICING_PARAMS } from './pricing';

// Convert a ProposalService to ProposalFormData for pricing calculation
function serviceToFormData(service: ProposalService): ProposalFormData {
  return {
    clientType: 'private',
    clientName: '',
    sector: '',
    serviceType: service.serviceType,
    estimatedDuration: service.estimatedDuration,
    durationUnit: service.durationUnit,
    locations: ['Luanda'],
    complexity: service.complexity,
    clientMaturity: 'medium',
    deliverables: service.deliverables,
    hasExistingTeam: false,
    methodology: 'hybrid',
    // Event fields
    eventType: service.eventType,
    coverageDuration: service.coverageDuration,
    eventDays: service.eventDays,
    eventStaffing: service.eventStaffing,
    eventExtras: service.eventExtras,
    includesPostProduction: !!service.postProductionHours,
    eventDate: service.eventDate,
    // Web/Systems fields
    webSystemsData: service.webProjectType ? {
      projectType: service.webProjectType,
      numberOfPages: service.numberOfPages,
      numberOfModules: service.numberOfModules,
      hasPaymentIntegration: service.hasPaymentIntegration,
      hasCrmIntegration: service.hasCrmIntegration,
      hasErpIntegration: service.hasErpIntegration,
      hasMaintenanceSupport: service.hasMaintenance,
      maintenanceMonths: service.maintenanceMonths,
    } : undefined,
    // Design fields
    designData: service.numberOfConcepts ? {
      numberOfConcepts: service.numberOfConcepts,
      numberOfRevisions: service.numberOfRevisions,
      includesBrandGuidelines: service.includesBrandGuidelines,
      deliverableFormats: service.deliverableFormats,
    } : undefined,
  };
}

export interface ServicePricingResult extends PricingResult {
  serviceId: string;
  serviceType: ServiceType;
}

export interface MultiServicePricingResult {
  services: ServicePricingResult[];
  totalBaseCost: number;
  totalOverhead: number;
  totalMargin: number;
  totalFinalPrice: number;
  totalHours: number;
  totalTeamMembers: number;
}

// Calculate pricing for a single service
export function calculateServicePricing(
  service: ProposalService,
  params?: PricingParams
): ServicePricingResult {
  const formData = serviceToFormData(service);
  const pricing = calculatePricing(formData, params);
  
  return {
    ...pricing,
    serviceId: service.id,
    serviceType: service.serviceType,
  };
}

// Calculate pricing for multiple services
export function calculateMultiServicePricing(
  services: ProposalService[],
  params?: PricingParams
): MultiServicePricingResult {
  const pricingParams = params || DEFAULT_PRICING_PARAMS;
  
  const servicePricings = services.map(service => 
    calculateServicePricing(service, pricingParams)
  );
  
  const totalBaseCost = servicePricings.reduce((sum, p) => sum + p.baseCost, 0);
  const totalOverhead = servicePricings.reduce((sum, p) => sum + p.overhead, 0);
  const totalMargin = servicePricings.reduce((sum, p) => sum + p.margin, 0);
  const totalFinalPrice = servicePricings.reduce((sum, p) => sum + p.finalPrice, 0);
  const totalHours = servicePricings.reduce((sum, p) => sum + p.totalHours, 0);
  
  // Count unique team members across all services
  const allTeamMembers = servicePricings.flatMap(p => p.teamMembers);
  const totalTeamMembers = allTeamMembers.length;
  
  return {
    services: servicePricings,
    totalBaseCost,
    totalOverhead,
    totalMargin,
    totalFinalPrice,
    totalHours,
    totalTeamMembers,
  };
}

// Update services with calculated values
export function updateServicesWithPricing(
  services: ProposalService[],
  params?: PricingParams
): ProposalService[] {
  return services.map(service => {
    const pricing = calculateServicePricing(service, params);
    return {
      ...service,
      serviceValue: pricing.finalPrice,
    };
  });
}
