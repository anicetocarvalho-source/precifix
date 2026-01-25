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
        .select('company_name, full_name')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile for branding:', error);
        return { companyName: 'PRECIFIX' };
      }

      return {
        companyName: profile.company_name || profile.full_name || 'PRECIFIX',
        contactEmail: user.email || undefined,
      };
    },
    enabled: !!user?.id,
  });

  return {
    branding: branding || { companyName: 'PRECIFIX' },
    isLoading,
  };
}
