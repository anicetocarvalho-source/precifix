import { ServiceType, SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS, ServiceCategory } from '@/types/proposal';
import { getServiceLabel } from '@/lib/serviceLabels';
import { cn } from '@/lib/utils';
import { CheckCircle, Briefcase, Camera, Video, Radio, Film, Palette, Globe, Code, Volume2, Megaphone, Sparkles, Calculator, MoreHorizontal, Eye, GraduationCap, ClipboardCheck, Target, RefreshCw } from 'lucide-react';

interface ServiceSelectorProps {
  value: ServiceType | undefined;
  onChange: (value: ServiceType) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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

const SERVICE_ICON_MAP: Record<ServiceType, React.ComponentType<{ className?: string }>> = {
  pmo: Briefcase,
  restructuring: RefreshCw,
  monitoring: Eye,
  training: GraduationCap,
  audit: ClipboardCheck,
  strategy: Target,
  photography: Camera,
  video_coverage: Video,
  streaming: Radio,
  video_editing: Film,
  graphic_design: Palette,
  web_development: Globe,
  systems_development: Code,
  sound_lighting: Volume2,
  marketing_digital: Megaphone,
  branding: Sparkles,
  financial_consulting: Calculator,
  other: MoreHorizontal,
};

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  consulting: 'bg-blue-500/10 text-blue-600 border-blue-200',
  creative: 'bg-purple-500/10 text-purple-600 border-purple-200',
  technology: 'bg-green-500/10 text-green-600 border-green-200',
  events: 'bg-orange-500/10 text-orange-600 border-orange-200',
};

const CATEGORY_ORDER: ServiceCategory[] = ['consulting', 'events', 'creative', 'technology'];

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
              const IconComponent = SERVICE_ICON_MAP[serviceType];
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
