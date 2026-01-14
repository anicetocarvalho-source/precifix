import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProposalService } from '@/types/proposalService';
import { SERVICE_LABELS, SERVICE_CATEGORIES, SERVICE_ICONS, DurationUnit } from '@/types/proposal';
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
  Copy,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SortableServiceCardProps {
  service: ProposalService;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
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

export function SortableServiceCard({
  service,
  index,
  isExpanded,
  onToggleExpand,
  onRemove,
  onEdit,
  onDuplicate,
  canRemove,
}: SortableServiceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const iconName = SERVICE_ICONS[service.serviceType];
  const IconComponent = ICON_MAP[iconName] || Briefcase;
  const category = SERVICE_CATEGORIES[service.serviceType];
  const label = SERVICE_LABELS[service.serviceType];
  
  const formatDuration = (duration: number, unit: DurationUnit) => {
    const unitLabel = duration === 1 ? DURATION_LABELS[unit].singular : DURATION_LABELS[unit].plural;
    return `${duration} ${unitLabel}`;
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-card border rounded-xl overflow-hidden transition-all",
        isExpanded ? "border-primary shadow-md" : "border-border",
        isDragging && "shadow-lg ring-2 ring-primary/20 opacity-90"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        {/* Drag Handle */}
        <div 
          className="flex items-center gap-2 text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 hover:text-primary transition-colors" />
          <span className="text-sm font-medium w-6">{index + 1}</span>
        </div>
        
        {/* Clickable area for expand/collapse */}
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-muted/30 -my-4 py-4 -mr-3 pr-3 rounded-r-lg transition-colors"
          onClick={onToggleExpand}
        >
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
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Editar Detalhes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Duplicar
                </Button>
              </div>
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
