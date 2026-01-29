import precifixLogoPath from '@/assets/precifix-logo.png';

// Default Precifix branding configuration
export const DEFAULT_BRANDING = {
  companyName: 'PRECIFIX',
  primaryColor: [237, 113, 39] as [number, number, number], // Orange from the logo
  website: 'www.precifix.ao',
};

// Convert image to base64 for PDF embedding
export async function loadLogoAsBase64(logoUrl?: string): Promise<string | undefined> {
  const url = logoUrl || precifixLogoPath;
  
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load logo:', error);
    return undefined;
  }
}

// Get branding config with defaults
export interface BrandingConfig {
  companyName?: string;
  companyLogo?: string;
  primaryColor?: [number, number, number];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
}

export function mergeBrandingWithDefaults(customBranding?: Partial<BrandingConfig>): BrandingConfig {
  return {
    companyName: customBranding?.companyName || DEFAULT_BRANDING.companyName,
    companyLogo: customBranding?.companyLogo,
    primaryColor: customBranding?.primaryColor || DEFAULT_BRANDING.primaryColor,
    website: customBranding?.website || DEFAULT_BRANDING.website,
    contactEmail: customBranding?.contactEmail,
    contactPhone: customBranding?.contactPhone,
    address: customBranding?.address,
  };
}
