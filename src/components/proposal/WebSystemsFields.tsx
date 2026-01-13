import { ProposalFormData, ProjectType, WebSystemsData } from '@/types/proposal';
import { cn } from '@/lib/utils';
import { CheckCircle, FileText, ShoppingCart, Database, Smartphone, Globe, Code, HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface WebSystemsFieldsProps {
  formData: Partial<ProposalFormData>;
  onChange: (data: Partial<ProposalFormData>) => void;
}

const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'landing_page', label: 'Landing Page', description: 'Página única promocional', icon: FileText },
  { value: 'ecommerce', label: 'E-Commerce', description: 'Loja online completa', icon: ShoppingCart },
  { value: 'erp', label: 'ERP / CRM', description: 'Sistema de gestão empresarial', icon: Database },
  { value: 'mobile_app', label: 'App Mobile', description: 'Aplicação móvel iOS/Android', icon: Smartphone },
  { value: 'webapp', label: 'Web App', description: 'Aplicação web completa', icon: Globe },
  { value: 'api', label: 'API / Backend', description: 'Serviços e integrações', icon: Code },
  { value: 'other', label: 'Outro', description: 'Outros projectos de desenvolvimento', icon: HelpCircle },
];

export function WebSystemsFields({ formData, onChange }: WebSystemsFieldsProps) {
  const webData = formData.webSystemsData || {};

  const updateWebData = (updates: Partial<WebSystemsData>) => {
    onChange({
      webSystemsData: {
        ...webData,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Project Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Tipo de Projecto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROJECT_TYPE_OPTIONS.map((option) => {
            const isSelected = webData.projectType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateWebData({ projectType: option.value })}
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

      {/* Pages/Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Dimensão do Projecto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Número de Páginas
            </label>
            <input
              type="number"
              min="1"
              value={webData.numberOfPages || ''}
              placeholder="Ex: 10"
              onChange={(e) => updateWebData({ numberOfPages: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Páginas/ecrãs principais do projecto
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Número de Módulos
            </label>
            <input
              type="number"
              min="1"
              value={webData.numberOfModules || ''}
              placeholder="Ex: 5"
              onChange={(e) => updateWebData({ numberOfModules: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Funcionalidades ou módulos distintos
            </p>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Integrações</h3>
        <div className="space-y-3">
          {[
            { key: 'hasPaymentIntegration' as keyof WebSystemsData, label: 'Integração de Pagamentos', description: 'Stripe, PayPal, Multicaixa, etc.' },
            { key: 'hasCrmIntegration' as keyof WebSystemsData, label: 'Integração CRM', description: 'Salesforce, HubSpot, etc.' },
            { key: 'hasErpIntegration' as keyof WebSystemsData, label: 'Integração ERP', description: 'SAP, Primavera, Odoo, etc.' },
          ].map(({ key, label, description }) => (
            <div
              key={key}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border transition-all',
                webData[key]
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <div>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={!!webData[key]}
                onCheckedChange={(checked) => updateWebData({ [key]: checked })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Manutenção e Suporte</h3>
        <div
          className={cn(
            'flex items-center justify-between p-4 rounded-lg border transition-all',
            webData.hasMaintenanceSupport
              ? 'border-primary bg-primary/5'
              : 'border-border'
          )}
        >
          <div>
            <p className="font-medium text-foreground">Incluir Manutenção</p>
            <p className="text-sm text-muted-foreground">Suporte técnico e actualizações</p>
          </div>
          <Switch
            checked={webData.hasMaintenanceSupport || false}
            onCheckedChange={(checked) => updateWebData({ hasMaintenanceSupport: checked })}
          />
        </div>

        {webData.hasMaintenanceSupport && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Meses de Manutenção
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={webData.maintenanceMonths || 6}
              onChange={(e) => updateWebData({ maintenanceMonths: parseInt(e.target.value) || 6 })}
              className="w-32 px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}
