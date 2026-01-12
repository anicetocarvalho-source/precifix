import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  User,
  Building,
  Palette,
  Bell,
  Calculator,
  Link as LinkIcon,
  Save,
  FlaskConical,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { PricingParametersForm } from '@/components/settings/PricingParametersForm';
import { PricingImpactSimulator } from '@/components/settings/PricingImpactSimulator';
import { UserManagement } from '@/components/settings/UserManagement';
import { useUserRole } from '@/hooks/useUserRole';
import { Badge } from '@/components/ui/badge';

type SettingsTab = 'profile' | 'company' | 'users' | 'pricing' | 'simulator' | 'appearance' | 'notifications' | 'integrations';

const tabs = [
  { id: 'profile' as const, label: 'Perfil', icon: User },
  { id: 'company' as const, label: 'Empresa', icon: Building },
  { id: 'users' as const, label: 'Utilizadores', icon: Shield, adminOnly: true },
  { id: 'pricing' as const, label: 'Precificação', icon: Calculator },
  { id: 'simulator' as const, label: 'Simulador', icon: FlaskConical },
  { id: 'appearance' as const, label: 'Aparência', icon: Palette },
  { id: 'notifications' as const, label: 'Notificações', icon: Bell },
  { id: 'integrations' as const, label: 'Integrações', icon: LinkIcon },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { isAdmin, role, loading: roleLoading } = useUserRole();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6 animate-slide-up">Configurações</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 flex-shrink-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Role Badge */}
            {!roleLoading && role && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">O seu papel</p>
                <Badge variant={role === 'admin' ? 'destructive' : role === 'gestor' ? 'default' : 'secondary'}>
                  {role === 'admin' ? 'Administrador' : role === 'gestor' ? 'Gestor' : 'Comercial'}
                </Badge>
              </div>
            )}
            <nav className="space-y-1">
              {tabs.map((tab) => {
                // Hide admin-only tabs from non-admins
                if ('adminOnly' in tab && tab.adminOnly && !isAdmin) {
                  return null;
                }
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-left',
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-brand'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-card rounded-xl border border-border p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Informações do Perfil</h2>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Alterar foto</Button>
                      <p className="text-sm text-muted-foreground mt-1">JPG, PNG. Máx 2MB.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Nome completo</label>
                      <input
                        type="text"
                        defaultValue="João Silva"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="joao@nodix.ao"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Cargo</label>
                      <input
                        type="text"
                        defaultValue="Gestor de Projectos"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                      <input
                        type="tel"
                        defaultValue="+244 923 456 789"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Guardar Alterações
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Informações da Empresa</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">Nome da empresa</label>
                      <input
                        type="text"
                        defaultValue="Nodix Consulting"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">NIF</label>
                      <input
                        type="text"
                        defaultValue="5417890123"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Sector</label>
                      <input
                        type="text"
                        defaultValue="Consultoria e Gestão"
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">Endereço</label>
                      <textarea
                        defaultValue="Rua Major Kanhangulo, 123, Maianga, Luanda, Angola"
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Guardar Alterações
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'users' && <UserManagement />}

            {activeTab === 'pricing' && <PricingParametersForm />}

            {activeTab === 'simulator' && <PricingImpactSimulator />}

            {activeTab === 'integrations' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-semibold text-foreground mb-4">Integrações Disponíveis</h2>
                <p className="text-muted-foreground mb-6">
                  Conecte o PRECIFIX com as suas ferramentas favoritas para automatizar fluxos de trabalho.
                </p>
                <div className="grid gap-4">
                  {[
                    { name: 'Microsoft 365', description: 'Armazenamento no OneDrive e integração com Office', status: 'Em breve' },
                    { name: 'Google Drive', description: 'Backup automático de documentos', status: 'Em breve' },
                    { name: 'HubSpot CRM', description: 'Sincronização de clientes e oportunidades', status: 'Em breve' },
                    { name: 'Salesforce', description: 'Gestão de pipeline comercial', status: 'Em breve' },
                    { name: 'Zoho CRM', description: 'Integração completa de vendas', status: 'Em breve' },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                    >
                      <div>
                        <p className="font-medium text-foreground">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {integration.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-semibold text-foreground mb-4">Preferências de Aparência</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">Tema</label>
                    <div className="flex gap-4">
                      <button className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-primary bg-primary/5">
                        <div className="w-6 h-6 rounded-full bg-background border border-border" />
                        <span className="font-medium">Claro</span>
                      </button>
                      <button className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-border hover:border-primary/50 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-foreground" />
                        <span className="font-medium">Escuro</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">Idioma</label>
                    <select className="px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Português (Portugal)</option>
                      <option>Português (Brasil)</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-semibold text-foreground mb-4">Preferências de Notificações</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Novas propostas', description: 'Receba notificações quando uma proposta for criada' },
                    { label: 'Alterações de status', description: 'Seja notificado quando o status de uma proposta mudar' },
                    { label: 'Lembretes', description: 'Receba lembretes sobre propostas pendentes' },
                    { label: 'Newsletter', description: 'Receba dicas e novidades sobre o PRECIFIX' },
                  ].map((notification) => (
                    <div
                      key={notification.label}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-medium text-foreground">{notification.label}</p>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
