import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProposalService } from '@/types/proposalService';
import { getServiceLabel } from '@/lib/serviceLabels';
import { Save, Loader2 } from 'lucide-react';

interface SaveAsTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  service: ProposalService | null;
  isSaving: boolean;
}

export function SaveAsTemplateDialog({
  isOpen,
  onClose,
  onSave,
  service,
  isSaving,
}: SaveAsTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim());
      setName('');
      setDescription('');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  const serviceLabel = service ? getServiceLabel(service.serviceType) : '';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Guardar como Template
          </DialogTitle>
          <DialogDescription>
            Guarde este serviço como template para reutilizar em futuras propostas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Nome do Template *</Label>
            <Input
              id="template-name"
              placeholder={`Ex: ${serviceLabel} - Cliente Tipo A`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Descrição (opcional)</Label>
            <Textarea
              id="template-description"
              placeholder="Descreva quando usar este template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {service && (
            <div className="bg-muted rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Detalhes do serviço:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Tipo: {serviceLabel}</li>
                <li>• Duração: {service.estimatedDuration} {service.durationUnit}</li>
                <li>• Complexidade: {service.complexity}</li>
                <li>• Entregáveis: {service.deliverables.length}</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
