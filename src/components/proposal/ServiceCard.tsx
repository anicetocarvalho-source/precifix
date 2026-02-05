import { ProposalService } from '@/types/proposalService';
import { SERVICE_CATEGORIES, SERVICE_ICONS, ServiceType, DurationUnit } from '@/types/proposal';
import { getServiceLabel } from '@/lib/serviceLabels';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/pricing';
import { 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  GripVertical,
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
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  service: ProposalService;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  onEdit: () => void;
  canRemove: boolean;
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

const DURATION_LABELS: Record<DurationUnit, { singular: string; plural: string }> = {
  days: { singular: 'dia', plural: 'dias' },
  weeks: { singular: 'semana', plural: 'semanas' },
  months: { singular: 'mês', plural: 'meses' },
};

const COMPLEXITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const CATEGORY_COLORS: Record<string, string> = {
  consulting: 'bg-blue-500/10 text-blue-600 border-blue-200',
  creative: 'bg-purple-500/10 text-purple-600 border-purple-200',
  technology: 'bg-green-500/10 text-green-600 border-green-200',
  events: 'bg-orange-500/10 text-orange-600 border-orange-200',
};

export function ServiceCard({
  service,
  index,
  isExpanded,
  onToggleExpand,
  onRemove,
  onEdit,
  canRemove,
}: ServiceCardProps) {
  const iconName = SERVICE_ICONS[service.serviceType];
  const IconComponent = ICON_MAP[iconName] || Briefcase;
  const category = SERVICE_CATEGORIES[service.serviceType];
  const label = getServiceLabel(service.serviceType);
  
  const formatDuration = (duration: number, unit: DurationUnit) => {
    const unitLabel = duration === 1 ? DURATION_LABELS[unit].singular : DURATION_LABELS[unit].plural;
    return `${duration} ${unitLabel}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-card border rounded-xl overflow-hidden transition-all",
        isExpanded ? "border-primary shadow-md" : "border-border"
      )}
    >
      {/* Header */}
      <div 
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <GripVertical className="w-4 h-4" />
          <span className="text-sm font-medium w-6">{index + 1}</span>
        </div>
        
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          CATEGORY_COLORS[category]
        )}>
          <IconComponent className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{label}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(service.estimatedDuration, service.durationUnit)}</span>
            <span className="text-border">•</span>
            <span>Complexidade {COMPLEXITY_LABELS[service.complexity]}</span>
          </div>
        </div>
        
        {service.serviceValue && service.serviceValue > 0 && (
          <div className="text-right">
            <p className="font-semibold text-foreground">
              {formatCurrency(service.serviceValue)}
            </p>
          </div>
        )}
        
        <Button variant="ghost" size="icon" className="shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border"
        >
          <div className="p-4 space-y-4">
            {/* Deliverables */}
            {service.deliverables.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Entregáveis</p>
                <div className="flex flex-wrap gap-1">
                  {service.deliverables.map((d, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={onEdit}>
                Editar Detalhes
              </Button>
              {canRemove && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remover
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
