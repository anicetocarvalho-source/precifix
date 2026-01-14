import {
  ServiceType,
  Complexity,
  DurationUnit,
  EventType,
  CoverageDuration,
  ProjectType,
  EventExtras,
  EventStaffing,
} from './proposal';
import { ProposalService } from './proposalService';

export interface ServiceTemplate {
  id: string;
  name: string;
  description?: string;
  serviceType: ServiceType;
  complexity: Complexity;
  estimatedDuration: number;
  durationUnit: DurationUnit;
  deliverables: string[];
  
  // Event fields
  eventType?: EventType;
  eventDays?: number;
  eventStaffing?: EventStaffing;
  eventExtras?: EventExtras;
  coverageDuration?: CoverageDuration;
  postProductionHours?: number;
  
  // Web/Systems fields
  webProjectType?: ProjectType;
  numberOfPages?: number;
  numberOfModules?: number;
  hasPaymentIntegration?: boolean;
  hasCrmIntegration?: boolean;
  hasErpIntegration?: boolean;
  hasMaintenance?: boolean;
  maintenanceMonths?: number;
  
  // Design fields
  numberOfConcepts?: number;
  numberOfRevisions?: number;
  includesBrandGuidelines?: boolean;
  deliverableFormats?: string[];
  
  // Metadata
  isSystemTemplate: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// Convert database row to ServiceTemplate
export function dbRowToTemplate(row: any): ServiceTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    serviceType: row.service_type as ServiceType,
    complexity: row.complexity as Complexity,
    estimatedDuration: row.estimated_duration,
    durationUnit: row.duration_unit as DurationUnit,
    deliverables: row.deliverables || [],
    eventType: row.event_type as EventType | undefined,
    eventDays: row.event_days || undefined,
    eventStaffing: row.event_staffing as EventStaffing | undefined,
    eventExtras: row.event_extras as EventExtras | undefined,
    coverageDuration: row.coverage_duration as CoverageDuration | undefined,
    postProductionHours: row.post_production_hours || undefined,
    webProjectType: row.web_project_type as ProjectType | undefined,
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
    isSystemTemplate: row.is_system_template,
    userId: row.user_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert ServiceTemplate to ProposalService
export function templateToService(template: ServiceTemplate): ProposalService {
  return {
    id: crypto.randomUUID(),
    serviceType: template.serviceType,
    complexity: template.complexity,
    estimatedDuration: template.estimatedDuration,
    durationUnit: template.durationUnit,
    deliverables: [...template.deliverables],
    eventType: template.eventType,
    eventDays: template.eventDays,
    eventStaffing: template.eventStaffing ? { ...template.eventStaffing } : undefined,
    eventExtras: template.eventExtras ? { ...template.eventExtras } : undefined,
    coverageDuration: template.coverageDuration,
    postProductionHours: template.postProductionHours,
    webProjectType: template.webProjectType,
    numberOfPages: template.numberOfPages,
    numberOfModules: template.numberOfModules,
    hasPaymentIntegration: template.hasPaymentIntegration,
    hasCrmIntegration: template.hasCrmIntegration,
    hasErpIntegration: template.hasErpIntegration,
    hasMaintenance: template.hasMaintenance,
    maintenanceMonths: template.maintenanceMonths,
    numberOfConcepts: template.numberOfConcepts,
    numberOfRevisions: template.numberOfRevisions,
    includesBrandGuidelines: template.includesBrandGuidelines,
    deliverableFormats: template.deliverableFormats ? [...template.deliverableFormats] : undefined,
    displayOrder: 0,
  };
}

// Convert ProposalService to template insert data
export function serviceToTemplateData(
  service: ProposalService, 
  name: string, 
  description: string,
  userId: string
): Omit<ServiceTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    description,
    serviceType: service.serviceType,
    complexity: service.complexity,
    estimatedDuration: service.estimatedDuration,
    durationUnit: service.durationUnit,
    deliverables: service.deliverables,
    eventType: service.eventType,
    eventDays: service.eventDays,
    eventStaffing: service.eventStaffing,
    eventExtras: service.eventExtras,
    coverageDuration: service.coverageDuration,
    postProductionHours: service.postProductionHours,
    webProjectType: service.webProjectType,
    numberOfPages: service.numberOfPages,
    numberOfModules: service.numberOfModules,
    hasPaymentIntegration: service.hasPaymentIntegration,
    hasCrmIntegration: service.hasCrmIntegration,
    hasErpIntegration: service.hasErpIntegration,
    hasMaintenance: service.hasMaintenance,
    maintenanceMonths: service.maintenanceMonths,
    numberOfConcepts: service.numberOfConcepts,
    numberOfRevisions: service.numberOfRevisions,
    includesBrandGuidelines: service.includesBrandGuidelines,
    deliverableFormats: service.deliverableFormats,
    isSystemTemplate: false,
    userId,
  };
}
