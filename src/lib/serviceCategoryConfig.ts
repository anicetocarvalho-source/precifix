import {
  Briefcase,
  Camera,
  Video,
  Radio,
  Film,
  Palette,
  Globe,
  Code,
  Volume2,
  Megaphone,
  Sparkles,
  Calculator,
  MoreHorizontal,
  Eye,
  GraduationCap,
  ClipboardCheck,
  Target,
  RefreshCw,
} from 'lucide-react';
import { ServiceType, ServiceCategory, DurationUnit, SERVICE_CATEGORIES, SERVICE_ICONS } from '@/types/proposal';

/**
 * Centralized icon map — maps icon name strings to Lucide components.
 * Used by TemplatePickerDialog, ServiceSelector, TemplateManagement, etc.
 */
export const SERVICE_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Camera,
  Video,
  Radio,
  Film,
  Palette,
  Globe,
  Code,
  Volume2,
  Megaphone,
  Sparkles,
  Calculator,
  MoreHorizontal,
  Eye,
  GraduationCap,
  ClipboardCheck,
  Target,
  RefreshCw,
};

/**
 * Category color classes — consistent across all components.
 */
export const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  consulting: 'bg-blue-500/10 text-blue-600 border-blue-200',
  creative: 'bg-purple-500/10 text-purple-600 border-purple-200',
  technology: 'bg-green-500/10 text-green-600 border-green-200',
  events: 'bg-orange-500/10 text-orange-600 border-orange-200',
};

/**
 * Duration labels — localized singular/plural for duration units.
 */
export const DURATION_LABELS: Record<DurationUnit, { singular: string; plural: string }> = {
  days: { singular: 'dia', plural: 'dias' },
  weeks: { singular: 'semana', plural: 'semanas' },
  months: { singular: 'mês', plural: 'meses' },
};

/**
 * Complexity labels — localized display names.
 */
export const COMPLEXITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

/**
 * Standard category display order.
 */
export const CATEGORY_ORDER: ServiceCategory[] = ['consulting', 'events', 'creative', 'technology'];

/**
 * Format a duration value with its localized unit label.
 */
export function formatDuration(duration: number, unit: DurationUnit): string {
  const unitLabel = duration === 1 ? DURATION_LABELS[unit].singular : DURATION_LABELS[unit].plural;
  return `${duration} ${unitLabel}`;
}

/**
 * Get the Lucide icon component for a given service type.
 */
export function getServiceIcon(serviceType: string): React.ComponentType<{ className?: string }> {
  const iconName = SERVICE_ICONS[serviceType as ServiceType];
  return SERVICE_ICON_COMPONENTS[iconName] || Briefcase;
}

/**
 * Get the category color classes for a given service type.
 */
export function getServiceCategoryColor(serviceType: string): string {
  const category = SERVICE_CATEGORIES[serviceType as ServiceType] || 'consulting';
  return CATEGORY_COLORS[category];
}

/**
 * Get a full config object (icon + color + category) for a service type.
 */
export function getServiceTypeConfig(serviceType: string) {
  const category = SERVICE_CATEGORIES[serviceType as ServiceType] || 'consulting';
  return {
    icon: getServiceIcon(serviceType),
    color: CATEGORY_COLORS[category],
    category,
  };
}
