import { useState } from 'react';
import { useProposalVersions, ProposalVersion } from '@/hooks/useProposalVersions';
import { formatCurrency } from '@/lib/pricing';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  History,
  Clock,
  ChevronRight,
  Loader2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProposalVersionHistoryProps {
  proposalId: string;
  onRestoreVersion?: (version: ProposalVersion) => void;
}

const serviceLabels: Record<string, string> = {
  pmo: 'PMO',
  restructuring: 'Reestruturação',
  monitoring: 'Acompanhamento',
  training: 'Formação',
  audit: 'Auditoria',
  strategy: 'Estratégia',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  sent: 'Enviada',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
};

export function ProposalVersionHistory({
  proposalId,
  onRestoreVersion,
}: ProposalVersionHistoryProps) {
  const { versions, isLoading } = useProposalVersions(proposalId);
  const [selectedVersion, setSelectedVersion] = useState<ProposalVersion | null>(null);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <History className="w-4 h-4" />
          Histórico
          {versions.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {versions.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Versões
          </SheetTitle>
          <SheetDescription>
            Veja todas as alterações feitas nesta proposta
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nenhuma versão anterior guardada</p>
              <p className="text-sm text-muted-foreground mt-1">
                As versões serão guardadas quando editar a proposta
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-8 bottom-4 w-0.5 bg-border" />

              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={cn(
                    'relative pl-10 pb-6 cursor-pointer transition-colors',
                    selectedVersion?.id === version.id && 'bg-muted/50 -mx-4 px-4 pl-14 rounded-lg'
                  )}
                  onClick={() => setSelectedVersion(
                    selectedVersion?.id === version.id ? null : version
                  )}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 bg-background z-10',
                      index === 0
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    )}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          Versão {version.version_number}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                            Atual
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(version.created_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {version.change_summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {version.change_summary}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 text-muted-foreground transition-transform',
                        selectedVersion?.id === version.id && 'rotate-90'
                      )}
                    />
                  </div>

                  {/* Expanded details */}
                  {selectedVersion?.id === version.id && (
                    <div className="mt-4 space-y-3 animate-fade-in">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-card rounded-lg p-3 border border-border">
                          <p className="text-muted-foreground">Cliente</p>
                          <p className="font-medium text-foreground truncate">
                            {version.client_name}
                          </p>
                        </div>
                        <div className="bg-card rounded-lg p-3 border border-border">
                          <p className="text-muted-foreground">Serviço</p>
                          <p className="font-medium text-foreground">
                            {serviceLabels[version.service_type] || version.service_type}
                          </p>
                        </div>
                        <div className="bg-card rounded-lg p-3 border border-border">
                          <p className="text-muted-foreground">Duração</p>
                          <p className="font-medium text-foreground">
                            {version.duration_months} meses
                          </p>
                        </div>
                        <div className="bg-card rounded-lg p-3 border border-border">
                          <p className="text-muted-foreground">Valor</p>
                          <p className="font-medium text-foreground">
                            {formatCurrency(version.total_value)}
                          </p>
                        </div>
                        <div className="bg-card rounded-lg p-3 border border-border">
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium text-foreground">
                            {statusLabels[version.status] || version.status}
                          </p>
                        </div>
                        <div className="bg-card rounded-lg p-3 border border-border">
                          <p className="text-muted-foreground">Localizações</p>
                          <p className="font-medium text-foreground truncate">
                            {version.locations.join(', ') || '-'}
                          </p>
                        </div>
                      </div>

                      {onRestoreVersion && index > 0 && (
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreVersion(version);
                          }}
                        >
                          Restaurar esta versão
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
