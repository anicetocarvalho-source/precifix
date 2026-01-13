import { ProposalFormData, EventType, CoverageDuration, EventExtras, EventStaffing } from '@/types/proposal';
import { cn } from '@/lib/utils';
import { CheckCircle, Building2, Heart, Users, Trees, Music, HelpCircle, Clock, Calendar, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface EventFieldsProps {
  formData: Partial<ProposalFormData>;
  onChange: (data: Partial<ProposalFormData>) => void;
}

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'corporate', label: 'Corporativo', description: 'Conferências, reuniões, lançamentos', icon: Building2 },
  { value: 'wedding', label: 'Casamento', description: 'Cerimónias e festas de casamento', icon: Heart },
  { value: 'conference', label: 'Conferência', description: 'Eventos académicos, seminários', icon: Users },
  { value: 'outdoor', label: 'Outdoor', description: 'Eventos ao ar livre', icon: Trees },
  { value: 'concert', label: 'Concerto', description: 'Espectáculos musicais', icon: Music },
  { value: 'other', label: 'Outro', description: 'Outros tipos de eventos', icon: HelpCircle },
];

const COVERAGE_DURATION_OPTIONS: { value: CoverageDuration; label: string; description: string }[] = [
  { value: 'half_day', label: 'Meio Dia', description: 'Até 4 horas de cobertura' },
  { value: 'full_day', label: 'Dia Inteiro', description: '8 horas de cobertura' },
  { value: 'multi_day', label: 'Multi-dias', description: 'Vários dias de cobertura' },
];

const EXTRAS_OPTIONS: { key: keyof EventExtras; label: string; description: string }[] = [
  { key: 'drone', label: 'Drone', description: 'Filmagem aérea' },
  { key: 'slider', label: 'Slider', description: 'Movimento cinematográfico' },
  { key: 'crane', label: 'Grua', description: 'Ângulos elevados' },
  { key: 'aerialCrane', label: 'Grua Aérea', description: 'Movimentos aéreos' },
  { key: 'specialLighting', label: 'Iluminação Especial', description: 'Setup de luz profissional' },
  { key: 'multicamStreaming', label: 'Streaming Multi-câmara', description: 'Transmissão ao vivo' },
  { key: 'advancedLedLighting', label: 'LED Avançado', description: 'Iluminação LED de alta qualidade' },
];

export function EventFields({ formData, onChange }: EventFieldsProps) {
  const eventExtras = formData.eventExtras || {};
  const eventStaffing = formData.eventStaffing || {};

  const updateStaffing = (key: keyof EventStaffing, delta: number) => {
    const current = eventStaffing[key] || 0;
    const newValue = Math.max(0, current + delta);
    onChange({
      eventStaffing: {
        ...eventStaffing,
        [key]: newValue,
      },
    });
  };

  const toggleExtra = (key: keyof EventExtras) => {
    onChange({
      eventExtras: {
        ...eventExtras,
        [key]: !eventExtras[key],
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Event Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Tipo de Evento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EVENT_TYPE_OPTIONS.map((option) => {
            const isSelected = formData.eventType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ eventType: option.value })}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    isSelected ? 'bg-primary/10' : 'bg-muted'
                  )}
                >
                  <option.icon
                    className={cn(
                      'w-5 h-5',
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coverage Duration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Duração da Cobertura</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {COVERAGE_DURATION_OPTIONS.map((option) => {
            const isSelected = formData.coverageDuration === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ coverageDuration: option.value })}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <Clock className={cn('w-6 h-6', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground text-center">{option.description}</p>
              </button>
            );
          })}
        </div>

        {formData.coverageDuration === 'multi_day' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Número de dias
            </label>
            <input
              type="number"
              min="2"
              value={formData.eventDays || 2}
              onChange={(e) => onChange({ eventDays: parseInt(e.target.value) || 2 })}
              className="w-32 px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        )}
      </div>

      {/* Event Date */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Data do Evento</h3>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <input
            type="date"
            value={formData.eventDate || ''}
            onChange={(e) => onChange({ eventDate: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Staffing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Equipa Técnica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'photographers' as keyof EventStaffing, label: 'Fotógrafos' },
            { key: 'videographers' as keyof EventStaffing, label: 'Videógrafos' },
            { key: 'operators' as keyof EventStaffing, label: 'Operadores de Câmara' },
            { key: 'soundTechnicians' as keyof EventStaffing, label: 'Técnicos de Som' },
            { key: 'lightingTechnicians' as keyof EventStaffing, label: 'Técnicos de Iluminação' },
            { key: 'editors' as keyof EventStaffing, label: 'Editores' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
              <span className="font-medium text-foreground">{label}</span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateStaffing(key, -1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{eventStaffing[key] || 0}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateStaffing(key, 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Equipamentos Extras</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXTRAS_OPTIONS.map((option) => (
            <div
              key={option.key}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border transition-all',
                eventExtras[option.key]
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <div>
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <Switch
                checked={eventExtras[option.key] || false}
                onCheckedChange={() => toggleExtra(option.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Post-Production */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Pós-Produção</h3>
        <div
          className={cn(
            'flex items-center justify-between p-4 rounded-lg border transition-all',
            formData.includesPostProduction
              ? 'border-primary bg-primary/5'
              : 'border-border'
          )}
        >
          <div>
            <p className="font-medium text-foreground">Incluir Pós-Produção</p>
            <p className="text-sm text-muted-foreground">Edição de vídeo e tratamento de fotos</p>
          </div>
          <Switch
            checked={formData.includesPostProduction || false}
            onCheckedChange={(checked) => onChange({ includesPostProduction: checked })}
          />
        </div>
      </div>
    </div>
  );
}
