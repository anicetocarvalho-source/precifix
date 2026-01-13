// Types for individual services within a proposal
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

// Individual service within a proposal
export interface ProposalService {
  id: string;
  serviceType: ServiceType;
  complexity: Complexity;
  estimatedDuration: number;
  durationUnit: DurationUnit;
  deliverables: string[];
  
  // Event-specific fields
  eventType?: EventType;
  eventDate?: string;
  eventDays?: number;
  eventStaffing?: EventStaffing;
  eventExtras?: EventExtras;
  coverageDuration?: CoverageDuration;
  postProductionHours?: number;
  
  // Web/Systems-specific fields
  webProjectType?: ProjectType;
  numberOfPages?: number;
  numberOfModules?: number;
  hasPaymentIntegration?: boolean;
  hasCrmIntegration?: boolean;
  hasErpIntegration?: boolean;
  hasMaintenance?: boolean;
  maintenanceMonths?: number;
  
  // Design-specific fields
  numberOfConcepts?: number;
  numberOfRevisions?: number;
  includesBrandGuidelines?: boolean;
  deliverableFormats?: string[];
  
  // Calculated value for this service
  serviceValue?: number;
  
  // Display order
  displayOrder: number;
}

// Database row type for proposal_services table
export interface ProposalServiceRow {
  id: string;
  proposal_id: string;
  service_type: string;
  complexity: string;
  estimated_duration: number;
  duration_unit: string;
  deliverables: string[];
  event_type: string | null;
  event_date: string | null;
  event_days: number | null;
  event_staffing: Record<string, unknown> | null;
  event_extras: Record<string, unknown> | null;
  coverage_duration: string | null;
  post_production_hours: number | null;
  web_project_type: string | null;
  number_of_pages: number | null;
  number_of_modules: number | null;
  has_payment_integration: boolean | null;
  has_crm_integration: boolean | null;
  has_erp_integration: boolean | null;
  has_maintenance: boolean | null;
  maintenance_months: number | null;
  number_of_concepts: number | null;
  number_of_revisions: number | null;
  includes_brand_guidelines: boolean | null;
  deliverable_formats: string[] | null;
  service_value: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Helper function to convert service to database row format
export function serviceToDbRow(service: ProposalService, proposalId: string): Omit<ProposalServiceRow, 'created_at' | 'updated_at'> {
  return {
    id: service.id,
    proposal_id: proposalId,
    service_type: service.serviceType,
    complexity: service.complexity,
    estimated_duration: service.estimatedDuration,
    duration_unit: service.durationUnit,
    deliverables: service.deliverables,
    event_type: service.eventType || null,
    event_date: service.eventDate || null,
    event_days: service.eventDays || null,
    event_staffing: service.eventStaffing as Record<string, unknown> || null,
    event_extras: service.eventExtras as Record<string, unknown> || null,
    coverage_duration: service.coverageDuration || null,
    post_production_hours: service.postProductionHours || null,
    web_project_type: service.webProjectType || null,
    number_of_pages: service.numberOfPages || null,
    number_of_modules: service.numberOfModules || null,
    has_payment_integration: service.hasPaymentIntegration || null,
    has_crm_integration: service.hasCrmIntegration || null,
    has_erp_integration: service.hasErpIntegration || null,
    has_maintenance: service.hasMaintenance || null,
    maintenance_months: service.maintenanceMonths || null,
    number_of_concepts: service.numberOfConcepts || null,
    number_of_revisions: service.numberOfRevisions || null,
    includes_brand_guidelines: service.includesBrandGuidelines || null,
    deliverable_formats: service.deliverableFormats || null,
    service_value: service.serviceValue || 0,
    display_order: service.displayOrder,
  };
}

// Helper function to convert database row to service
export function dbRowToService(row: ProposalServiceRow): ProposalService {
  return {
    id: row.id,
    serviceType: row.service_type as ServiceType,
    complexity: row.complexity as Complexity,
    estimatedDuration: row.estimated_duration,
    durationUnit: row.duration_unit as DurationUnit,
    deliverables: row.deliverables || [],
    eventType: row.event_type as EventType | undefined,
    eventDate: row.event_date || undefined,
    eventDays: row.event_days || undefined,
    eventStaffing: row.event_staffing as EventStaffing | undefined,
    eventExtras: row.event_extras as EventExtras | undefined,
    coverageDuration: row.coverage_duration as CoverageDuration | undefined,
    postProductionHours: row.post_production_hours || undefined,
    webProjectType: row.web_project_type as ProjectType | undefined,
    numberOfPages: row.number_of_pages || undefined,
    numberOfModules: row.number_of_modules || undefined,
    hasPaymentIntegration: row.has_payment_integration || undefined,
    hasCrmIntegration: row.has_crm_integration || undefined,
    hasErpIntegration: row.has_erp_integration || undefined,
    hasMaintenance: row.has_maintenance || undefined,
    maintenanceMonths: row.maintenance_months || undefined,
    numberOfConcepts: row.number_of_concepts || undefined,
    numberOfRevisions: row.number_of_revisions || undefined,
    includesBrandGuidelines: row.includes_brand_guidelines || undefined,
    deliverableFormats: row.deliverable_formats || undefined,
    serviceValue: row.service_value,
    displayOrder: row.display_order,
  };
}

// Default service template
export function createDefaultService(serviceType?: ServiceType): ProposalService {
  return {
    id: crypto.randomUUID(),
    serviceType: serviceType || 'pmo',
    complexity: 'medium',
    estimatedDuration: 1,
    durationUnit: 'months',
    deliverables: [],
    displayOrder: 0,
  };
}
