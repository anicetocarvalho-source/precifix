export type ClientType = 'public' | 'private' | 'ngo' | 'startup';
export type Complexity = 'low' | 'medium' | 'high';

// Expanded service types to include creative and technical sectors
export type ServiceType = 
  // Original PMO/Consulting services
  | 'pmo' 
  | 'restructuring' 
  | 'monitoring' 
  | 'training' 
  | 'audit' 
  | 'strategy'
  // New creative/technical services
  | 'photography'
  | 'video_coverage'
  | 'streaming'
  | 'video_editing'
  | 'graphic_design'
  | 'web_development'
  | 'systems_development'
  | 'sound_lighting'
  | 'marketing_digital'
  | 'branding'
  | 'financial_consulting'
  | 'other';

export type Methodology = 'traditional' | 'agile' | 'hybrid';
export type ProposalStatus = 'draft' | 'pending' | 'sent' | 'approved' | 'rejected';

// Service categories for grouping
export type ServiceCategory = 
  | 'consulting'
  | 'creative'
  | 'technology'
  | 'events';

// Event-specific types
export type EventType = 'corporate' | 'wedding' | 'conference' | 'outdoor' | 'concert' | 'other';
export type CoverageDuration = 'half_day' | 'full_day' | 'multi_day';

// Web/Systems specific types
export type ProjectType = 'landing_page' | 'ecommerce' | 'erp' | 'mobile_app' | 'webapp' | 'api' | 'other';

// Equipment extras for events
export interface EventExtras {
  drone?: boolean;
  slider?: boolean;
  crane?: boolean;
  aerialCrane?: boolean;
  specialLighting?: boolean;
  multicamStreaming?: boolean;
  advancedLedLighting?: boolean;
}

// Staffing for events
export interface EventStaffing {
  photographers?: number;
  videographers?: number;
  operators?: number;
  soundTechnicians?: number;
  lightingTechnicians?: number;
  editors?: number;
}

// Web/Systems specific data
export interface WebSystemsData {
  projectType?: ProjectType;
  numberOfPages?: number;
  numberOfModules?: number;
  hasPaymentIntegration?: boolean;
  hasCrmIntegration?: boolean;
  hasErpIntegration?: boolean;
  hasMaintenanceSupport?: boolean;
  maintenanceMonths?: number;
}

// Design specific data
export interface DesignData {
  numberOfConcepts?: number;
  numberOfRevisions?: number;
  deliverableFormats?: string[];
  includesBrandGuidelines?: boolean;
}

export interface ProposalFormData {
  // Client info
  clientType: ClientType;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  sector: string;
  
  // Service details
  serviceType: ServiceType;
  estimatedDuration: number; // months for consulting, days/hours for events
  locations: string[];
  complexity: Complexity;
  clientMaturity: 'low' | 'medium' | 'high';
  
  // Deliverables
  deliverables: string[];
  hasExistingTeam: boolean;
  
  // Methodology
  methodology: Methodology;
  
  // Event-specific fields (optional)
  eventType?: EventType;
  coverageDuration?: CoverageDuration;
  eventDays?: number;
  eventExtras?: EventExtras;
  eventStaffing?: EventStaffing;
  includesPostProduction?: boolean;
  eventDate?: string;
  
  // Web/Systems specific fields (optional)
  webSystemsData?: WebSystemsData;
  
  // Design specific fields (optional)
  designData?: DesignData;
}

export interface TeamMember {
  role: string;
  hourlyRate: number;
  hoursPerMonth: number;
  dedication: number; // percentage
}

export interface ExtraItem {
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface PricingResult {
  teamMembers: TeamMember[];
  totalHours: number;
  baseCost: number;
  complexityMultiplier: number;
  overhead: number;
  margin: number;
  finalPrice: number;
  extras?: ExtraItem[];
  extrasTotal?: number;
}

export interface SavedPricingParams {
  hourlyRates: {
    seniorManager: number;
    consultant: number;
    analyst: number;
    coordinator: number;
    trainer: number;
    // New creative/technical roles
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
  // Equipment/Extras pricing
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

export interface Proposal {
  id: string;
  formData: ProposalFormData;
  pricing: PricingResult;
  pricingParams?: SavedPricingParams;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Pricing constants - Original PMO/Consulting rates
export const HOURLY_RATES = {
  seniorManager: 100000,
  consultant: 75000,
  analyst: 45000,
  coordinator: 60000,
  trainer: 50000,
} as const;

// New creative/technical rates (as specified)
export const CREATIVE_HOURLY_RATES = {
  videographer: 85000,
  photographer: 65000,
  videoEditor: 60000,
  graphicDesigner: 55000,
  webDeveloper: 80000,
  soundTechnician: 50000,
  lightingTechnician: 50000,
} as const;

// Equipment/Extras pricing (fixed prices)
export const EXTRAS_PRICING = {
  drone: 150000,           // per event
  multicamStreaming: 300000, // per event
  advancedLedLighting: 75000, // per event
  slider: 50000,           // per event
  crane: 200000,           // per event
  aerialCrane: 350000,     // per event
} as const;

export const COMPLEXITY_MULTIPLIERS = {
  low: 1,
  medium: 1.2,
  high: 1.5,
} as const;

export const OVERHEAD_PERCENTAGE = 0.15;
export const MARGIN_PERCENTAGE = 0.25;

// Service category mapping
export const SERVICE_CATEGORIES: Record<ServiceType, ServiceCategory> = {
  pmo: 'consulting',
  restructuring: 'consulting',
  monitoring: 'consulting',
  training: 'consulting',
  audit: 'consulting',
  strategy: 'consulting',
  financial_consulting: 'consulting',
  photography: 'events',
  video_coverage: 'events',
  streaming: 'events',
  sound_lighting: 'events',
  video_editing: 'creative',
  graphic_design: 'creative',
  branding: 'creative',
  marketing_digital: 'creative',
  web_development: 'technology',
  systems_development: 'technology',
  other: 'consulting',
};

// Service labels for display
export const SERVICE_LABELS: Record<ServiceType, string> = {
  pmo: 'PMO e Gestão de Projectos',
  restructuring: 'Reestruturação',
  monitoring: 'Acompanhamento',
  training: 'Formação',
  audit: 'Auditoria',
  strategy: 'Estratégia',
  photography: 'Fotografia Profissional',
  video_coverage: 'Cobertura de Vídeo',
  streaming: 'Streaming e Transmissões',
  video_editing: 'Edição e Pós-Produção',
  graphic_design: 'Design Gráfico',
  web_development: 'Desenvolvimento Web',
  systems_development: 'Desenvolvimento de Sistemas',
  sound_lighting: 'Som e Iluminação',
  marketing_digital: 'Marketing Digital',
  branding: 'Branding e Identidade Visual',
  financial_consulting: 'Consultoria Financeira',
  other: 'Outros Serviços',
};

// Service icons (for reference in components)
export const SERVICE_ICONS: Record<ServiceType, string> = {
  pmo: 'Briefcase',
  restructuring: 'RefreshCw',
  monitoring: 'Eye',
  training: 'GraduationCap',
  audit: 'ClipboardCheck',
  strategy: 'Target',
  photography: 'Camera',
  video_coverage: 'Video',
  streaming: 'Radio',
  video_editing: 'Film',
  graphic_design: 'Palette',
  web_development: 'Globe',
  systems_development: 'Code',
  sound_lighting: 'Volume2',
  marketing_digital: 'Megaphone',
  branding: 'Sparkles',
  financial_consulting: 'Calculator',
  other: 'MoreHorizontal',
};
