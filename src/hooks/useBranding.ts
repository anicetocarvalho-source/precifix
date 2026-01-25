import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { BrandingConfig } from '@/lib/pdfExportMultiService';

export function useBranding() {
  const { user } = useAuth();

  const { data: branding, isLoading } = useQuery({
    queryKey: ['branding', user?.id],
    queryFn: async (): Promise<BrandingConfig> => {
      if (!user?.id) {
        return { companyName: 'PRECIFIX' };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('company_name, full_name, website, contact_phone, primary_color, logo_url, company_address')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile for branding:', error);
        return { companyName: 'PRECIFIX' };
      }

      // Parse primary color from hex to RGB
      let primaryColor: [number, number, number] | undefined;
      if (profile.primary_color) {
        const hex = profile.primary_color.replace('#', '');
        primaryColor = [
          parseInt(hex.substring(0, 2), 16),
          parseInt(hex.substring(2, 4), 16),
          parseInt(hex.substring(4, 6), 16),
        ];
      }

      return {
        companyName: profile.company_name || profile.full_name || 'PRECIFIX',
        companyLogo: profile.logo_url || undefined,
        primaryColor,
        contactEmail: user.email || undefined,
        contactPhone: profile.contact_phone || undefined,
        website: profile.website || undefined,
        address: profile.company_address || undefined,
      };
    },
    enabled: !!user?.id,
  });

  return {
    branding: branding || { companyName: 'PRECIFIX' },
    isLoading,
  };
}
