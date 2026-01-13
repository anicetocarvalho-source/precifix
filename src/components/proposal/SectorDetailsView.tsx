import { ProposalFormData, SERVICE_LABELS, SERVICE_CATEGORIES } from '@/types/proposal';
import { formatCurrency } from '@/lib/pricing';
import { 
  Camera, Video, Users, Music, Settings, Calendar, Clock, 
  Layers, Globe, CreditCard, Building, Wrench, Palette,
  FileImage, RefreshCw, BookOpen, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SectorDetailsViewProps {
  formData: ProposalFormData;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  corporate: 'Corporativo',
  wedding: 'Casamento',
  conference: 'Conferência',
  outdoor: 'Outdoor',
  concert: 'Concerto',
  other: 'Outro',
};

const COVERAGE_DURATION_LABELS: Record<string, string> = {
  half_day: 'Meio Dia (até 4h)',
  full_day: 'Dia Inteiro (8h)',
  multi_day: 'Multi-dias',
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  landing_page: 'Landing Page',
  ecommerce: 'E-commerce',
  erp: 'ERP / Sistema de Gestão',
  mobile_app: 'Aplicação Móvel',
  webapp: 'Aplicação Web',
  api: 'API / Backend',
  other: 'Outro',
};

export function SectorDetailsView({ formData }: SectorDetailsViewProps) {
  const category = SERVICE_CATEGORIES[formData.serviceType];

  // Events category display
  if (category === 'events') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full gradient-brand text-primary-foreground text-sm flex items-center justify-center">
            <Camera className="w-3 h-3" />
          </span>
          Detalhes do Evento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Event Type */}
          {formData.eventType && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Video className="w-4 h-4" />
                <span className="text-sm">Tipo de Evento</span>
              </div>
              <p className="font-semibold text-foreground">
                {EVENT_TYPE_LABELS[formData.eventType] || formData.eventType}
              </p>
            </div>
          )}

          {/* Coverage Duration */}
          {formData.coverageDuration && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Duração da Cobertura</span>
              </div>
              <p className="font-semibold text-foreground">
                {COVERAGE_DURATION_LABELS[formData.coverageDuration] || formData.coverageDuration}
                {formData.coverageDuration === 'multi_day' && formData.eventDays && (
                  <span className="text-muted-foreground font-normal"> ({formData.eventDays} dias)</span>
                )}
              </p>
            </div>
          )}

          {/* Event Date */}
          {formData.eventDate && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Data do Evento</span>
              </div>
              <p className="font-semibold text-foreground">
                {new Date(formData.eventDate).toLocaleDateString('pt-PT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Staffing */}
        {formData.eventStaffing && Object.values(formData.eventStaffing).some(v => v && v > 0) && (
          <div className="bg-muted/30 rounded-xl p-6">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Equipa Técnica
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {formData.eventStaffing.photographers && formData.eventStaffing.photographers > 0 && (
                <div className="bg-background rounded-lg p-3 border border-border text-center">
                  <Camera className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{formData.eventStaffing.photographers}</p>
                  <p className="text-xs text-muted-foreground">Fotógrafos</p>
                </div>
              )}
              {formData.eventStaffing.videographers && formData.eventStaffing.videographers > 0 && (
                <div className="bg-background rounded-lg p-3 border border-border text-center">
                  <Video className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{formData.eventStaffing.videographers}</p>
                  <p className="text-xs text-muted-foreground">Videógrafos</p>
                </div>
              )}
              {formData.eventStaffing.operators && formData.eventStaffing.operators > 0 && (
                <div className="bg-background rounded-lg p-3 border border-border text-center">
                  <Settings className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{formData.eventStaffing.operators}</p>
                  <p className="text-xs text-muted-foreground">Operadores</p>
                </div>
              )}
              {formData.eventStaffing.soundTechnicians && formData.eventStaffing.soundTechnicians > 0 && (
                <div className="bg-background rounded-lg p-3 border border-border text-center">
                  <Music className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{formData.eventStaffing.soundTechnicians}</p>
                  <p className="text-xs text-muted-foreground">Som</p>
                </div>
              )}
              {formData.eventStaffing.lightingTechnicians && formData.eventStaffing.lightingTechnicians > 0 && (
                <div className="bg-background rounded-lg p-3 border border-border text-center">
                  <Sparkles className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{formData.eventStaffing.lightingTechnicians}</p>
                  <p className="text-xs text-muted-foreground">Iluminação</p>
                </div>
              )}
              {formData.eventStaffing.editors && formData.eventStaffing.editors > 0 && (
                <div className="bg-background rounded-lg p-3 border border-border text-center">
                  <Layers className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold text-foreground">{formData.eventStaffing.editors}</p>
                  <p className="text-xs text-muted-foreground">Editores</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Extras */}
        {formData.eventExtras && Object.values(formData.eventExtras).some(v => v) && (
          <div className="bg-muted/30 rounded-xl p-6">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Equipamentos Extras
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.eventExtras.drone && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3">🚁 Drone</Badge>
              )}
              {formData.eventExtras.slider && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3">📹 Slider</Badge>
              )}
              {formData.eventExtras.crane && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3">🏗️ Grua</Badge>
              )}
              {formData.eventExtras.aerialCrane && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3">🏗️ Grua Aérea</Badge>
              )}
              {formData.eventExtras.specialLighting && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3">💡 Iluminação Especial</Badge>
              )}
              {formData.eventExtras.multicamStreaming && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3">📡 Streaming Multi-câmara</Badge>
              )}
              {formData.eventExtras.advancedLedLighting && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3">✨ LED Avançado</Badge>
              )}
            </div>
          </div>
        )}

        {/* Post Production */}
        {formData.includesPostProduction && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
            <Layers className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Pós-Produção Incluída</p>
              <p className="text-sm text-muted-foreground">Edição de vídeo e tratamento de fotografias</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Technology category display
  if (category === 'technology') {
    const webData = formData.webSystemsData || {};
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full gradient-brand text-primary-foreground text-sm flex items-center justify-center">
            <Globe className="w-3 h-3" />
          </span>
          Detalhes do Projecto Web/Sistemas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Project Type */}
          {webData.projectType && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Tipo de Projecto</span>
              </div>
              <p className="font-semibold text-foreground">
                {PROJECT_TYPE_LABELS[webData.projectType] || webData.projectType}
              </p>
            </div>
          )}

          {/* Number of Pages */}
          {webData.numberOfPages && webData.numberOfPages > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileImage className="w-4 h-4" />
                <span className="text-sm">Número de Páginas</span>
              </div>
              <p className="font-semibold text-foreground">{webData.numberOfPages} páginas</p>
            </div>
          )}

          {/* Number of Modules */}
          {webData.numberOfModules && webData.numberOfModules > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Layers className="w-4 h-4" />
                <span className="text-sm">Número de Módulos</span>
              </div>
              <p className="font-semibold text-foreground">{webData.numberOfModules} módulos</p>
            </div>
          )}
        </div>

        {/* Integrations */}
        {(webData.hasPaymentIntegration || webData.hasCrmIntegration || webData.hasErpIntegration) && (
          <div className="bg-muted/30 rounded-xl p-6">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Integrações
            </h4>
            <div className="flex flex-wrap gap-2">
              {webData.hasPaymentIntegration && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Pagamentos
                </Badge>
              )}
              {webData.hasCrmIntegration && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3 flex items-center gap-1">
                  <Users className="w-3 h-3" /> CRM
                </Badge>
              )}
              {webData.hasErpIntegration && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3 flex items-center gap-1">
                  <Building className="w-3 h-3" /> ERP
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Maintenance */}
        {webData.hasMaintenanceSupport && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
            <Wrench className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Manutenção e Suporte Incluídos</p>
              <p className="text-sm text-muted-foreground">
                {webData.maintenanceMonths || 6} meses de suporte técnico
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Creative category display
  if (category === 'creative') {
    const designData = formData.designData || {};
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-full gradient-brand text-primary-foreground text-sm flex items-center justify-center">
            <Palette className="w-3 h-3" />
          </span>
          Detalhes do Projecto Criativo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Number of Concepts */}
          {designData.numberOfConcepts && designData.numberOfConcepts > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Layers className="w-4 h-4" />
                <span className="text-sm">Conceitos Criativos</span>
              </div>
              <p className="font-semibold text-foreground">{designData.numberOfConcepts} propostas</p>
            </div>
          )}

          {/* Number of Revisions */}
          {designData.numberOfRevisions && designData.numberOfRevisions > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Revisões Incluídas</span>
              </div>
              <p className="font-semibold text-foreground">{designData.numberOfRevisions} rondas</p>
            </div>
          )}

          {/* Brand Guidelines */}
          {designData.includesBrandGuidelines && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Manual de Marca</span>
              </div>
              <p className="font-semibold text-foreground">Incluído</p>
            </div>
          )}
        </div>

        {/* Deliverable Formats */}
        {designData.deliverableFormats && designData.deliverableFormats.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-6">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              Formatos de Entrega
            </h4>
            <div className="flex flex-wrap gap-2">
              {designData.deliverableFormats.map((format) => (
                <Badge key={format} variant="secondary" className="text-sm py-1.5 px-3">
                  {format.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Brand Guidelines Detail */}
        {designData.includesBrandGuidelines && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Manual de Identidade Visual</p>
              <p className="text-sm text-muted-foreground">
                Guia completo de aplicação da marca com regras de uso
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Consulting category - no specific fields to display
  return null;
}
