import { ProposalService } from '@/types/proposalService';
import { SERVICE_CATEGORIES } from '@/types/proposal';
import { getServiceLabel } from '@/lib/serviceLabels';
import { formatCurrency } from '@/lib/pricing';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  Wrench,
  Monitor,
  Palette,
  Video,
  Camera,
  Layers,
  Check,
  Clock,
} from 'lucide-react';

interface ProposalServicesViewProps {
  services: ProposalService[];
}

const COMPLEXITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  corporate: 'Evento Corporativo',
  wedding: 'Casamento',
  conference: 'Conferência',
  product_launch: 'Lançamento de Produto',
  social: 'Evento Social',
  music: 'Evento Musical',
  sports: 'Evento Desportivo',
};

const WEB_PROJECT_TYPE_LABELS: Record<string, string> = {
  landing_page: 'Landing Page',
  institutional_site: 'Site Institucional',
  ecommerce: 'E-commerce',
  web_app: 'Web Application',
  mobile_app: 'Aplicação Móvel',
  erp_system: 'Sistema ERP',
  crm_system: 'Sistema CRM',
  custom_software: 'Software Customizado',
};

const getServiceIcon = (serviceType: string) => {
  const category = SERVICE_CATEGORIES[serviceType];
  switch (category) {
    case 'events':
      return <Video className="w-4 h-4" />;
    case 'technology':
      return <Monitor className="w-4 h-4" />;
    case 'creative':
      return <Palette className="w-4 h-4" />;
    default:
      return <Wrench className="w-4 h-4" />;
  }
};

const getCategoryColor = (serviceType: string) => {
  const category = SERVICE_CATEGORIES[serviceType];
  switch (category) {
    case 'events':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'technology':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'creative':
      return 'bg-pink-100 text-pink-700 border-pink-200';
    default:
      return 'bg-amber-100 text-amber-700 border-amber-200';
  }
};

function ServiceDetailsSection({ service }: { service: ProposalService }) {
  const category = SERVICE_CATEGORIES[service.serviceType];

  if (category === 'events') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
        {service.eventType && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Video className="w-4 h-4" />
            <span>{EVENT_TYPE_LABELS[service.eventType] || service.eventType}</span>
          </div>
        )}
        {service.eventDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(service.eventDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        {service.eventDays && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{service.eventDays} dia(s)</span>
          </div>
        )}
        {service.eventStaffing && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {(service.eventStaffing.photographers || 0) + (service.eventStaffing.videographers || 0)} profissionais
            </span>
          </div>
        )}
        {service.eventExtras && (
          <div className="flex flex-wrap gap-2 col-span-2 md:col-span-4 mt-2">
            {service.eventExtras.drone && (
              <Badge variant="outline" className="text-xs">Drone</Badge>
            )}
            {service.eventExtras.slider && (
              <Badge variant="outline" className="text-xs">Slider</Badge>
            )}
            {service.eventExtras.crane && (
              <Badge variant="outline" className="text-xs">Grua</Badge>
            )}
            {service.eventExtras.specialLighting && (
              <Badge variant="outline" className="text-xs">Iluminação Especial</Badge>
            )}
            {service.eventExtras.multicamStreaming && (
              <Badge variant="outline" className="text-xs">Streaming Multicam</Badge>
            )}
            {service.eventExtras.advancedLedLighting && (
              <Badge variant="outline" className="text-xs">LED Avançado</Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  if (category === 'technology') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
        {service.webProjectType && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Monitor className="w-4 h-4" />
            <span>{WEB_PROJECT_TYPE_LABELS[service.webProjectType] || service.webProjectType}</span>
          </div>
        )}
        {service.numberOfPages && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers className="w-4 h-4" />
            <span>{service.numberOfPages} páginas</span>
          </div>
        )}
        {service.numberOfModules && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wrench className="w-4 h-4" />
            <span>{service.numberOfModules} módulos</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 col-span-2 md:col-span-4 mt-2">
          {service.hasPaymentIntegration && (
            <Badge variant="outline" className="text-xs">Pagamentos</Badge>
          )}
          {service.hasCrmIntegration && (
            <Badge variant="outline" className="text-xs">CRM</Badge>
          )}
          {service.hasErpIntegration && (
            <Badge variant="outline" className="text-xs">ERP</Badge>
          )}
          {service.hasMaintenance && (
            <Badge variant="outline" className="text-xs">
              Manutenção ({service.maintenanceMonths || 6} meses)
            </Badge>
          )}
        </div>
      </div>
    );
  }

  if (category === 'creative') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
        {service.numberOfConcepts && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Palette className="w-4 h-4" />
            <span>{service.numberOfConcepts} conceitos</span>
          </div>
        )}
        {service.numberOfRevisions && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wrench className="w-4 h-4" />
            <span>{service.numberOfRevisions} revisões</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 col-span-2 md:col-span-4 mt-2">
          {service.includesBrandGuidelines && (
            <Badge variant="outline" className="text-xs">Brand Guidelines</Badge>
          )}
          {service.deliverableFormats?.map((format) => (
            <Badge key={format} variant="outline" className="text-xs">{format}</Badge>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function ProposalServicesView({ services }: ProposalServicesViewProps) {
  if (!services || services.length === 0) {
    return null;
  }

  const totalValue = services.reduce((sum, s) => sum + (s.serviceValue || 0), 0);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full gradient-brand text-primary-foreground text-sm flex items-center justify-center">
            <Layers className="w-3 h-3" />
          </span>
          Serviços ({services.length})
        </h3>
        <div className="text-lg font-bold text-primary">
          {formatCurrency(totalValue)}
        </div>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="bg-muted/50 rounded-lg p-4 border border-border"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(service.serviceType)}`}>
                  {getServiceIcon(service.serviceType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">
                      {getServiceLabel(service.serviceType)}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {COMPLEXITY_LABELS[service.complexity]} complexidade
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {service.estimatedDuration} {service.durationUnit === 'days' ? 'dia(s)' : service.durationUnit === 'weeks' ? 'semana(s)' : 'mês(es)'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {formatCurrency(service.serviceValue || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Serviço #{index + 1}</p>
              </div>
            </div>

            {service.deliverables && service.deliverables.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Entregáveis:</p>
                <div className="flex flex-wrap gap-2">
                  {service.deliverables.map((deliverable, i) => (
                    <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {deliverable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <ServiceDetailsSection service={service} />
          </div>
        ))}
      </div>
    </section>
  );
}
