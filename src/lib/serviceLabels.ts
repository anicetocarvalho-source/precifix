import { SERVICE_LABELS, SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS, ServiceType, ServiceCategory } from '@/types/proposal';

/**
 * Get the full map of service type → readable label.
 * Use this when you need to iterate over all service types (e.g. for select dropdowns).
 */
export function getAllServiceLabels(): Record<ServiceType, string> {
  return SERVICE_LABELS;
}

/**
 * Get a readable label for a service type.
 * Falls back to the raw value if not found in the map.
 */
export function getServiceLabel(serviceType: string | undefined | null): string {
  if (!serviceType) return 'Serviço';
  return SERVICE_LABELS[serviceType as ServiceType] || serviceType;
}

/**
 * Get a short label for a service type (useful for tables/badges).
 * Truncates long labels while keeping them readable.
 */
export function getServiceLabelShort(serviceType: string | undefined | null, maxLength = 20): string {
  const label = getServiceLabel(serviceType);
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 1) + '…';
}

/**
 * Get the category for a service type.
 */
export function getServiceCategory(serviceType: string | undefined | null): ServiceCategory {
  if (!serviceType) return 'consulting';
  return SERVICE_CATEGORIES[serviceType as ServiceType] || 'consulting';
}

/**
 * Get a readable label for a service category.
 */
export function getServiceCategoryLabel(category: string | undefined | null): string {
  if (!category) return 'Consultoria';
  return SERVICE_CATEGORY_LABELS[category as ServiceCategory] || category;
}
