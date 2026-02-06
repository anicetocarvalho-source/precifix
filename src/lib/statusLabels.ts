import { ProposalStatus, Complexity, Methodology } from '@/types/proposal';

/**
 * Centralized status configuration for consistent display across Dashboard, History, and ProposalView.
 */
export const STATUS_CONFIG: Record<ProposalStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning' },
  sent: { label: 'Enviada', color: 'bg-info/10 text-info' },
  approved: { label: 'Aprovada', color: 'bg-success/10 text-success' },
  rejected: { label: 'Rejeitada', color: 'bg-destructive/10 text-destructive' },
};

export function getStatusLabel(status: ProposalStatus): string {
  return STATUS_CONFIG[status]?.label || status;
}

export function getStatusColor(status: ProposalStatus): string {
  return STATUS_CONFIG[status]?.color || 'bg-muted text-muted-foreground';
}

/**
 * Centralized complexity labels.
 */
export const COMPLEXITY_LABELS: Record<Complexity, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export function getComplexityLabel(complexity: string | undefined | null): string {
  if (!complexity) return 'Média';
  return COMPLEXITY_LABELS[complexity as Complexity] || complexity;
}

/**
 * Centralized methodology labels.
 */
export const METHODOLOGY_LABELS: Record<Methodology, string> = {
  traditional: 'Tradicional (Waterfall)',
  agile: 'Ágil (Scrum/Kanban)',
  hybrid: 'Híbrida',
};

export function getMethodologyLabel(methodology: string | undefined | null): string {
  if (!methodology) return 'Híbrida';
  return METHODOLOGY_LABELS[methodology as Methodology] || methodology;
}

/**
 * Centralized duration formatting.
 */
export const DURATION_UNIT_LABELS: Record<string, { singular: string; plural: string }> = {
  days: { singular: 'dia', plural: 'dias' },
  weeks: { singular: 'semana', plural: 'semanas' },
  months: { singular: 'mês', plural: 'meses' },
};

export function formatDuration(duration: number, unit: string = 'months'): string {
  const labels = DURATION_UNIT_LABELS[unit] || DURATION_UNIT_LABELS.months;
  const label = duration === 1 ? labels.singular : labels.plural;
  return `${duration} ${label}`;
}
