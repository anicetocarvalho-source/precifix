import { ProposalFormData, DesignData } from '@/types/proposal';
import { cn } from '@/lib/utils';
import { Plus, Minus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface DesignFieldsProps {
  formData: Partial<ProposalFormData>;
  onChange: (data: Partial<ProposalFormData>) => void;
}

const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'ai', label: 'Adobe Illustrator (.ai)' },
  { value: 'psd', label: 'Photoshop (.psd)' },
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
  { value: 'svg', label: 'SVG' },
  { value: 'eps', label: 'EPS' },
  { value: 'indd', label: 'InDesign (.indd)' },
];

export function DesignFields({ formData, onChange }: DesignFieldsProps) {
  const designData = formData.designData || {};

  const updateDesignData = (updates: Partial<DesignData>) => {
    onChange({
      designData: {
        ...designData,
        ...updates,
      },
    });
  };

  const updateCounter = (key: 'numberOfConcepts' | 'numberOfRevisions', delta: number) => {
    const current = designData[key] || 1;
    const newValue = Math.max(1, current + delta);
    updateDesignData({ [key]: newValue });
  };

  const toggleFormat = (format: string) => {
    const current = designData.deliverableFormats || [];
    const updated = current.includes(format)
      ? current.filter((f) => f !== format)
      : [...current, format];
    updateDesignData({ deliverableFormats: updated });
  };

  return (
    <div className="space-y-8">
      {/* Concepts and Revisions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Propostas e Revisões</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Conceitos Iniciais</p>
                <p className="text-sm text-muted-foreground">Propostas de design diferentes</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateCounter('numberOfConcepts', -1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{designData.numberOfConcepts || 1}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateCounter('numberOfConcepts', 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Rondas de Revisão</p>
                <p className="text-sm text-muted-foreground">Número de iterações incluídas</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateCounter('numberOfRevisions', -1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{designData.numberOfRevisions || 1}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateCounter('numberOfRevisions', 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverable Formats */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Formatos de Entrega</h3>
        <p className="text-sm text-muted-foreground">Selecione os formatos de ficheiro desejados</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FORMAT_OPTIONS.map((option) => {
            const isSelected = designData.deliverableFormats?.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleFormat(option.value)}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <span className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                  {option.label}
                </span>
                {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Guidelines */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Manual de Marca</h3>
        <div
          className={cn(
            'flex items-center justify-between p-4 rounded-lg border transition-all',
            designData.includesBrandGuidelines
              ? 'border-primary bg-primary/5'
              : 'border-border'
          )}
        >
          <div>
            <p className="font-medium text-foreground">Incluir Manual de Identidade</p>
            <p className="text-sm text-muted-foreground">Documento com directrizes de uso da marca</p>
          </div>
          <Switch
            checked={designData.includesBrandGuidelines || false}
            onCheckedChange={(checked) => updateDesignData({ includesBrandGuidelines: checked })}
          />
        </div>
      </div>
    </div>
  );
}
