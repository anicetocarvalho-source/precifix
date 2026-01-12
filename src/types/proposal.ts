export type ClientType = 'public' | 'private' | 'ngo' | 'startup';
export type Complexity = 'low' | 'medium' | 'high';
export type ServiceType = 'pmo' | 'restructuring' | 'monitoring' | 'training' | 'audit' | 'strategy';
export type Methodology = 'traditional' | 'agile' | 'hybrid';
export type ProposalStatus = 'draft' | 'pending' | 'sent' | 'approved' | 'rejected';

export interface ProposalFormData {
  // Client info
  clientType: ClientType;
  clientName: string;
  clientEmail?: string;
  sector: string;
  
  // Service details
  serviceType: ServiceType;
  estimatedDuration: number; // months
  locations: string[];
  complexity: Complexity;
  clientMaturity: 'low' | 'medium' | 'high';
  
  // Deliverables
  deliverables: string[];
  hasExistingTeam: boolean;
  
  // Methodology
  methodology: Methodology;
}

export interface TeamMember {
  role: string;
  hourlyRate: number;
  hoursPerMonth: number;
  dedication: number; // percentage
}

export interface PricingResult {
  teamMembers: TeamMember[];
  totalHours: number;
  baseCost: number;
  complexityMultiplier: number;
  overhead: number;
  margin: number;
  finalPrice: number;
}

export interface Proposal {
  id: string;
  formData: ProposalFormData;
  pricing: PricingResult;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Pricing constants
export const HOURLY_RATES = {
  seniorManager: 100000,
  consultant: 75000,
  analyst: 45000,
  coordinator: 60000,
  trainer: 50000,
} as const;

export const COMPLEXITY_MULTIPLIERS = {
  low: 1,
  medium: 1.2,
  high: 1.5,
} as const;

export const OVERHEAD_PERCENTAGE = 0.15;
export const MARGIN_PERCENTAGE = 0.25;
