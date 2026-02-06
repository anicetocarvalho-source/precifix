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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/pricing';
import { ServiceType } from '@/types/proposal';
import { getServiceLabel } from '@/lib/serviceLabels';
import { Mail, Loader2, Send, Eye, Pencil } from 'lucide-react';

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  serviceType: ServiceType;
  sector: string;
  totalValue: number;
  duration: number;
  deliverables: string[];
  methodology: string;
  clientEmail: string;
  onClientEmailChange: (email: string) => void;
  customMessage: string;
  onCustomMessageChange: (message: string) => void;
  onSend: () => void;
  onSkip?: () => void;
  isSending: boolean;
  showSkipButton?: boolean;
  title?: string;
  description?: string;
}

const getMethodologyName = (methodology: string): string => {
  const names: Record<string, string> = {
    traditional: 'Tradicional (Waterfall)',
    agile: 'Ágil (Scrum/Kanban)',
    hybrid: 'Híbrida',
  };
  return names[methodology] || methodology;
};

const deliverableLabels: Record<string, string> = {
  reports: 'Relatórios de progresso',
  dashboards: 'Dashboards de acompanhamento',
  kpis: 'Sistema de KPIs',
  schedules: 'Cronogramas actualizados',
  training: 'Sessões de formação',
  documentation: 'Documentação de processos',
  presentations: 'Apresentações executivas',
  action_plans: 'Planos de acção',
};

export function SendEmailDialog({
  open,
  onOpenChange,
  clientName,
  serviceType,
  sector,
  totalValue,
  duration,
  deliverables,
  methodology,
  clientEmail,
  onClientEmailChange,
  customMessage,
  onCustomMessageChange,
  onSend,
  onSkip,
  isSending,
  showSkipButton = false,
  title = 'Enviar Proposta por Email',
  description = 'Envie a proposta diretamente para o email do cliente.',
}: SendEmailDialogProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const serviceLabel = getServiceLabel(serviceType);
  const formattedDeliverables = deliverables.map(d => deliverableLabels[d] || d);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="gap-2">
              <Pencil className="w-4 h-4" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Pré-visualizar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email do Cliente *</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="cliente@empresa.com"
                value={clientEmail}
                onChange={(e) => onClientEmailChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customMessage">Mensagem Personalizada (opcional)</Label>
              <Textarea
                id="customMessage"
                placeholder="Adicione uma mensagem personalizada para o cliente..."
                value={customMessage}
                onChange={(e) => onCustomMessageChange(e.target.value)}
                rows={4}
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Resumo da Proposta</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Cliente:</strong> {clientName}</p>
                <p><strong>Serviço:</strong> {serviceLabel}</p>
                <p><strong>Valor:</strong> {formatCurrency(totalValue)}</p>
                <p><strong>Duração:</strong> {duration} {duration === 1 ? 'mês' : 'meses'}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-lg overflow-hidden bg-background">
              {/* Email Header Mock */}
              <div className="bg-muted/70 p-3 border-b text-xs space-y-1">
                <p>
                  <span className="font-semibold text-muted-foreground">De:</span>{' '}
                  <span className="text-foreground">PRECIFIX &lt;onboarding@resend.dev&gt;</span>
                </p>
                <p>
                  <span className="font-semibold text-muted-foreground">Para:</span>{' '}
                  <span className="text-foreground">{clientEmail || 'cliente@exemplo.com'}</span>
                </p>
                <p>
                  <span className="font-semibold text-muted-foreground">Assunto:</span>{' '}
                  <span className="text-foreground">Proposta de Consultoria - {serviceLabel} | {clientName}</span>
                </p>
              </div>

              {/* Email Body */}
              <ScrollArea className="h-[320px]">
                <div className="bg-slate-100 dark:bg-slate-900/50 p-6">
                  <div className="max-w-[500px] mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                    {/* Email Header */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 p-6">
                      <h1 className="text-white font-bold text-2xl">PRECIFIX</h1>
                      <p className="text-white/80 text-sm mt-1">Sistema de Precificação de Consultoria</p>
                    </div>

                    {/* Email Content */}
                    <div className="p-6 space-y-4 text-slate-800 dark:text-slate-200">
                      <h2 className="text-lg font-semibold">
                        Prezado(a) {clientName},
                      </h2>

                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {customMessage || 'Temos o prazer de apresentar a nossa proposta de serviços de consultoria para a sua organização.'}
                      </p>

                      {/* Proposal Summary Box */}
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-3">
                        <h3 className="text-primary font-bold text-xs uppercase tracking-wider">
                          Resumo da Proposta
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Serviço:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{serviceLabel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Setor:</span>
                            <span className="text-slate-800 dark:text-slate-200">{sector}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Metodologia:</span>
                            <span className="text-slate-800 dark:text-slate-200">{getMethodologyName(methodology)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Duração:</span>
                            <span className="text-slate-800 dark:text-slate-200">{duration} {duration === 1 ? 'mês' : 'meses'}</span>
                          </div>
                          <div className="border-t border-slate-200 dark:border-slate-600 my-2" />
                          <div className="flex justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Valor Total:</span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(totalValue)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deliverables */}
                      {formattedDeliverables.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            Entregáveis Incluídos:
                          </h3>
                          <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            {formattedDeliverables.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Para mais detalhes sobre a proposta completa, incluindo metodologia detalhada, cronograma e equipa proposta, entre em contacto connosco.
                      </p>

                      {/* CTA Button */}
                      <div className="text-center pt-2">
                        <span className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold text-sm">
                          Responder a Esta Proposta
                        </span>
                      </div>
                    </div>

                    {/* Email Footer */}
                    <div className="bg-slate-800 dark:bg-slate-950 p-4 text-center">
                      <p className="text-white font-medium text-sm">Equipa Nodix</p>
                      <p className="text-slate-400 text-xs mt-1">Nodix Consultoria • Luanda, Angola</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          {showSkipButton && onSkip && (
            <Button
              variant="outline"
              onClick={onSkip}
              className="w-full sm:w-auto"
            >
              Saltar
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSend}
            disabled={isSending || !clientEmail}
            className="w-full sm:w-auto gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                A enviar...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Proposta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
