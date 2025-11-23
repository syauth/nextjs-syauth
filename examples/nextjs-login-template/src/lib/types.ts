// Branding configuration interface
export interface BrandingConfig {
  logo_url?: string
  company_name?: string
  primary_color: string
  secondary_color: string
  background_color: string
  theme: 'light' | 'dark' | 'auto'
  // custom_css removed for security (XSS vulnerability)
  show_social_logins: boolean
  terms_url?: string
  privacy_url?: string
}

// External OAuth provider interface
export interface ExternalProvider {
  id: string
  name: string
  provider_type: string
  is_active: boolean
}

// Default branding configuration
export const DEFAULT_BRANDING: BrandingConfig = {
  company_name: 'Login',
  primary_color: '#4F46E5',
  secondary_color: '#10B981',
  background_color: '#F9FAFB',
  theme: 'light',
  show_social_logins: true,
}
