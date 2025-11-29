import { BrandingConfig, DEFAULT_BRANDING } from './types'
import axios from 'axios'
import https from 'https'

/**
 * Get branding configuration from environment variables or API
 */
export function getBrandingFromEnv(): Partial<BrandingConfig> {
  return {
    logo_url: process.env.NEXT_PUBLIC_LOGO_URL,
    company_name: process.env.NEXT_PUBLIC_COMPANY_NAME,
    primary_color: process.env.NEXT_PUBLIC_PRIMARY_COLOR,
    secondary_color: process.env.NEXT_PUBLIC_SECONDARY_COLOR,
    background_color: process.env.NEXT_PUBLIC_BACKGROUND_COLOR,
    theme: (process.env.NEXT_PUBLIC_THEME as 'light' | 'dark' | 'auto') || undefined,
    show_social_logins: process.env.NEXT_PUBLIC_SHOW_SOCIAL_LOGINS === 'true',
    terms_url: process.env.NEXT_PUBLIC_TERMS_URL,
    privacy_url: process.env.NEXT_PUBLIC_PRIVACY_URL,
  }
}

/**
 * Merge branding configurations with priority:
 * 1. API branding (from SyAuth)
 * 2. Environment variables
 * 3. Default values
 */
export function mergeBranding(
  apiBranding?: Partial<BrandingConfig> | null,
  envBranding?: Partial<BrandingConfig>
): BrandingConfig {
  return {
    ...DEFAULT_BRANDING,
    ...envBranding,
    ...apiBranding,
  } as BrandingConfig
}

/**
 * Fetch branding from SyAuth API
 */
export async function fetchBrandingFromAPI(
  clientId: string
): Promise<Partial<BrandingConfig> | null> {
  // For public login pages, we don't fetch branding from the API
  // because the endpoint requires authentication.
  // Instead, configure branding via environment variables in .env.local
  return null
}
