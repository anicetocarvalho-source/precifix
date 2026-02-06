import { ServiceType, SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS, ServiceCategory } from '@/types/proposal';
import { getServiceLabel } from '@/lib/serviceLabels';
import { getServiceIcon, CATEGORY_COLORS, CATEGORY_ORDER } from '@/lib/serviceCategoryConfig';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface ServiceSelectorProps {
  value: ServiceType | undefined;
  onChange: (value: ServiceType) => void;
}

export function ServiceSelector({ value, onChange }: ServiceSelectorProps) {
  // Group services by category
  const servicesByCategory = CATEGORY_ORDER.reduce((acc, category) => {
    const services = (Object.entries(SERVICE_CATEGORIES) as [ServiceType, ServiceCategory][])
      .filter(([_, cat]) => cat === category)
      .map(([service]) => service);
    acc[category] = services;
    return acc;
  }, {} as Record<ServiceCategory, ServiceType[]>);

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map((category) => (
        <div key={category} className="space-y-3">
          <h4 className={cn(
            "text-sm font-semibold px-3 py-1 rounded-full inline-block",
            CATEGORY_COLORS[category]
          )}>
            {SERVICE_CATEGORY_LABELS[category]}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {servicesByCategory[category].map((serviceType) => {
              const IconComponent = getServiceIcon(serviceType);
              const isSelected = value === serviceType;

              return (
                <button
                  key={serviceType}
                  type="button"
                  onClick={() => onChange(serviceType)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    )}
                  >
                    <IconComponent
                      className={cn(
                        'w-4 h-4',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <span className={cn(
                    "text-sm font-medium flex-1",
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}>
                    {getServiceLabel(serviceType)}
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
