import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Upload, 
  Trash2, 
  Building, 
  Globe, 
  Phone, 
  Palette,
  Loader2,
  ImageIcon,
  MapPin,
} from 'lucide-react';

interface BrandingData {
  company_name: string | null;
  website: string | null;
  contact_phone: string | null;
  primary_color: string | null;
  logo_url: string | null;
  company_address: string | null;
}

const PRESET_COLORS = [
  { name: 'Azul', value: '#2563eb' },
  { name: 'Vermelho', value: '#dc2626' },
  { name: 'Verde', value: '#059669' },
  { name: 'Roxo', value: '#7c3aed' },
  { name: 'Laranja', value: '#ea580c' },
  { name: 'Rosa', value: '#db2777' },
  { name: 'Ciano', value: '#0891b2' },
  { name: 'Cinza', value: '#475569' },
];

export function BrandingSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<BrandingData>({
    company_name: '',
    website: '',
    contact_phone: '',
    primary_color: '#2563eb',
    logo_url: null,
    company_address: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-branding', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('company_name, website, contact_phone, primary_color, logo_url, company_address')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        website: profile.website || '',
        contact_phone: profile.contact_phone || '',
        primary_color: profile.primary_color || '#2563eb',
        logo_url: profile.logo_url || null,
        company_address: profile.company_address || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: BrandingData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: data.company_name || null,
          website: data.website || null,
          contact_phone: data.contact_phone || null,
          primary_color: data.primary_color || '#2563eb',
          logo_url: data.logo_url,
          company_address: data.company_address || null,
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-branding'] });
      queryClient.invalidateQueries({ queryKey: ['branding'] });
      toast.success('Configurações de branding guardadas!');
    },
    onError: (error) => {
      console.error('Error updating branding:', error);
      toast.error('Erro ao guardar configurações');
    },
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;
      
      // Delete old logo if exists
      if (formData.logo_url) {
        const oldPath = formData.logo_url.split('/company-logos/')[1];
        if (oldPath) {
          await supabase.storage.from('company-logos').remove([oldPath]);
        }
      }
      
      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, logo_url: publicUrl.publicUrl }));
      toast.success('Logo carregado com sucesso!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao carregar logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!formData.logo_url || !user?.id) return;
    
    try {
      const path = formData.logo_url.split('/company-logos/')[1];
      if (path) {
        await supabase.storage.from('company-logos').remove([path]);
      }
      setFormData(prev => ({ ...prev, logo_url: null }));
      toast.success('Logo removido');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Erro ao remover logo');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Branding da Empresa</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure o branding que será usado nos PDFs das propostas.
        </p>
      </div>

      {/* Logo Section */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-base">
          <ImageIcon className="w-4 h-4" />
          Logo da Empresa
        </Label>
        
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
            {formData.logo_url ? (
              <img 
                src={formData.logo_url} 
                alt="Logo da empresa" 
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <Building className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                />
                <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                  <span>
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isUploading ? 'A carregar...' : 'Carregar Logo'}
                  </span>
                </Button>
              </label>
              {formData.logo_url && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={handleRemoveLogo}
                >
                  <Trash2 className="w-4 h-4" />
                  Remover
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou SVG. Tamanho máximo: 2MB.<br />
              Recomendado: fundo transparente, 400x400px.
            </p>
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="company_name" className="flex items-center gap-2">
          <Building className="w-4 h-4" />
          Nome da Empresa
        </Label>
        <Input
          id="company_name"
          value={formData.company_name || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
          placeholder="Ex: Nodix Consulting"
          className="max-w-md"
        />
        <p className="text-xs text-muted-foreground">
          Este nome aparecerá no cabeçalho e rodapé dos PDFs.
        </p>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Website
        </Label>
        <Input
          id="website"
          type="url"
          value={formData.website || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          placeholder="https://www.suaempresa.com"
          className="max-w-md"
        />
      </div>

      {/* Contact Phone */}
      <div className="space-y-2">
        <Label htmlFor="contact_phone" className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Telefone de Contacto
        </Label>
        <Input
          id="contact_phone"
          type="tel"
          value={formData.contact_phone || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
          placeholder="+244 923 456 789"
          className="max-w-md"
        />
      </div>

      {/* Company Address */}
      <div className="space-y-2">
        <Label htmlFor="company_address" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Endereço da Empresa
        </Label>
        <Textarea
          id="company_address"
          value={formData.company_address || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, company_address: e.target.value }))}
          placeholder="Ex: Rua das Flores, 123, Luanda, Angola"
          className="max-w-md resize-none"
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Este endereço aparecerá no rodapé dos PDFs.
        </p>
      </div>

      {/* Primary Color */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Cor Principal
        </Label>
        
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg border border-border shadow-sm"
            style={{ backgroundColor: formData.primary_color || '#2563eb' }}
          />
          <Input
            type="color"
            value={formData.primary_color || '#2563eb'}
            onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
            className="w-16 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={formData.primary_color || '#2563eb'}
            onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
            placeholder="#2563eb"
            className="w-28 font-mono text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, primary_color: color.value }))}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                formData.primary_color === color.value 
                  ? 'border-foreground scale-110' 
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Esta cor será usada nos cabeçalhos e acentos do PDF.
        </p>
      </div>

      {/* Preview */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm font-medium text-foreground mb-3">Pré-visualização</p>
        <div 
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: formData.primary_color || '#2563eb' }}
        >
          <div className="p-4 text-white">
            <div className="flex items-center gap-3">
              {formData.logo_url ? (
                <img 
                  src={formData.logo_url} 
                  alt="Logo" 
                  className="w-10 h-10 object-contain bg-white rounded"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-bold">{formData.company_name || 'Nome da Empresa'}</p>
                <p className="text-xs opacity-80">PROPOSTA COMERCIAL</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 p-2 flex justify-between text-xs" style={{ color: formData.primary_color || '#2563eb' }}>
            <span>{formData.website || 'www.suaempresa.com'}</span>
            <span>{formData.contact_phone || '+244 923 456 789'}</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" className="gap-2" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar Configurações
        </Button>
      </div>
    </form>
  );
}
