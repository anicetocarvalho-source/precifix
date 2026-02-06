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
  LayoutTemplate,
  FileImage,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { PricingParametersForm } from '@/components/settings/PricingParametersForm';
import { PricingImpactSimulator } from '@/components/settings/PricingImpactSimulator';
import { UserManagement } from '@/components/settings/UserManagement';
import { TemplateManagement } from '@/components/settings/TemplateManagement';
import { BrandingSettings } from '@/components/settings/BrandingSettings';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'company' | 'branding' | 'users' | 'templates' | 'pricing' | 'simulator' | 'appearance' | 'notifications' | 'integrations';

const tabs = [
  { id: 'profile' as const, label: 'Perfil', icon: User },
  { id: 'company' as const, label: 'Empresa', icon: Building },
  { id: 'branding' as const, label: 'Branding', icon: FileImage },
  { id: 'users' as const, label: 'Utilizadores', icon: Shield, requiresRole: 'admin' as const },
  { id: 'templates' as const, label: 'Templates', icon: LayoutTemplate },
  { id: 'pricing' as const, label: 'Precificação', icon: Calculator, requiresRole: 'pricing' as const },
  { id: 'simulator' as const, label: 'Simulador', icon: FlaskConical, requiresRole: 'pricing' as const },
  { id: 'appearance' as const, label: 'Aparência', icon: Palette },
  { id: 'notifications' as const, label: 'Notificações', icon: Bell },
  { id: 'integrations' as const, label: 'Integrações', icon: LinkIcon },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { isAdmin, canManagePricing, role, loading: roleLoading } = useUserRole();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch profile data from DB
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, company_name, contact_phone, company_address, website')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    cargo: '',
    phone: '',
  });

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    nif: '',
    sector: '',
    address: '',
  });

  // Sync DB data to forms
  useEffect(() => {
    if (profile) {
      setProfileForm(prev => ({
        ...prev,
        fullName: profile.full_name || '',
        phone: profile.contact_phone || '',
      }));
      setCompanyForm(prev => ({
        ...prev,
        companyName: profile.company_name || '',
        address: profile.company_address || '',
      }));
    }
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [profile, user]);

  // Save profile mutation
  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.fullName || null,
          contact_phone: profileForm.phone || null,
        })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
      queryClient.invalidateQueries({ queryKey: ['branding'] });
      toast.success('Perfil guardado com sucesso!');
    },
    onError: () => toast.error('Erro ao guardar perfil'),
  });

  // Save company mutation
  const saveCompany = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: companyForm.companyName || null,
          company_address: companyForm.address || null,
        })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });
      queryClient.invalidateQueries({ queryKey: ['profile-branding'] });
      queryClient.invalidateQueries({ queryKey: ['branding'] });
      toast.success('Dados da empresa guardados com sucesso!');
    },
    onError: () => toast.error('Erro ao guardar dados da empresa'),
  });

  // Tab visibility based on role
  const isTabVisible = (tab: typeof tabs[number]) => {
    if (!tab.requiresRole) return true;
    if (tab.requiresRole === 'admin') return isAdmin;
    if (tab.requiresRole === 'pricing') return canManagePricing;
    return true;
  };

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
                if (!isTabVisible(tab)) return null;
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
                  {profileLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
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
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="O seu nome completo"
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            disabled
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed"
                          />
                          <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado aqui.</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Cargo</label>
                          <input
                            type="text"
                            value={profileForm.cargo}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, cargo: e.target.value }))}
                            placeholder="Ex: Gestor de Projectos"
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+244 923 456 789"
                            className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button 
                    className="gap-2" 
                    onClick={() => saveProfile.mutate()}
                    disabled={saveProfile.isPending}
                  >
                    {saveProfile.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar Alterações
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Informações da Empresa</h2>
                  {profileLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">Nome da empresa</label>
                        <input
                          type="text"
                          value={companyForm.companyName}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Nome da sua empresa"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Este nome é partilhado com o branding e aparecerá nos PDFs.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">NIF</label>
                        <input
                          type="text"
                          value={companyForm.nif}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, nif: e.target.value }))}
                          placeholder="NIF da empresa"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Sector</label>
                        <input
                          type="text"
                          value={companyForm.sector}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, sector: e.target.value }))}
                          placeholder="Ex: Consultoria e Gestão"
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">Endereço</label>
                        <textarea
                          value={companyForm.address}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Endereço completo da empresa"
                          rows={2}
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Partilhado com o branding — aparecerá no rodapé dos PDFs.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button 
                    className="gap-2"
                    onClick={() => saveCompany.mutate()}
                    disabled={saveCompany.isPending}
                  >
                    {saveCompany.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar Alterações
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'branding' && <BrandingSettings />}

            {activeTab === 'users' && <UserManagement />}

            {activeTab === 'templates' && <TemplateManagement />}

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
