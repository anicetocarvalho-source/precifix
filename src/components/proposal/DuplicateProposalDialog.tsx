import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';

interface DuplicateProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalName: string;
  onConfirm: (newName: string) => void;
  isPending?: boolean;
}

export function DuplicateProposalDialog({
  open,
  onOpenChange,
  originalName,
  onConfirm,
  isPending = false,
}: DuplicateProposalDialogProps) {
  const [newName, setNewName] = useState(`${originalName} (Cópia)`);

  const handleConfirm = () => {
    if (newName.trim()) {
      onConfirm(newName.trim());
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setNewName(`${originalName} (Cópia)`);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-primary" />
            Duplicar Proposta
          </DialogTitle>
          <DialogDescription>
            Edite o nome do cliente para a nova proposta duplicada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <Input
              id="clientName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome do cliente"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!newName.trim() || isPending}
            className="gap-2"
          >
            {isPending ? 'A duplicar...' : 'Duplicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
