import { SERVICE_LABELS, ServiceType } from '@/types/proposal';

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
