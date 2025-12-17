'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import LoginForm from '@/components/LoginForm'
import { BrandingConfig, ExternalProvider } from '@/lib/types'
import { getBrandingFromEnv, mergeBranding } from '@/lib/branding'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [branding, setBranding] = useState<BrandingConfig | null>(null)
  const [externalProviders, setExternalProviders] = useState<ExternalProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get OAuth parameters from URL
  const clientId = searchParams.get('client_id') || process.env.NEXT_PUBLIC_SYAUTH_CLIENT_ID || ''
  const redirectUri = searchParams.get('redirect_uri') || ''
  const state = searchParams.get('state') || ''

  useEffect(() => {
    const loadBranding = async () => {
      try {
        setLoading(true)

        // Fetch branding from API route
        const response = await fetch(`/api/branding?client_id=${clientId}`)

        if (response.ok) {
          const data = await response.json()
          
          // Extract branding and external providers from response
          if (data.branding) {
            setBranding(data.branding)
          } else {
            // If response is just branding object (backward compatibility)
            setBranding(data)
          }
          
          // Set external providers if available
          if (data.externalProviders && Array.isArray(data.externalProviders)) {
            setExternalProviders(data.externalProviders.filter((p: ExternalProvider) => p.is_active))
          } else {
            setExternalProviders([])
          }
        } else {
          // Fallback to env-only branding
          const envBranding = getBrandingFromEnv()
          const fallbackBranding = mergeBranding(null, envBranding)
          setBranding(fallbackBranding)
          setExternalProviders([])
        }
      } catch (err) {

        // Fallback to env-only branding
        const envBranding = getBrandingFromEnv()
        const fallbackBranding = mergeBranding(null, envBranding)
        setBranding(fallbackBranding)
        setExternalProviders([])
      } finally {
        setLoading(false)
      }
    }

    loadBranding()
  }, [clientId])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.125rem',
        color: '#4a5568'
      }}>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.125rem',
        color: '#c53030'
      }}>
        Error: {error}
      </div>
    )
  }

  if (!branding) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.125rem',
        color: '#4a5568'
      }}>
        Failed to load branding configuration
      </div>
    )
  }

  return (
    <LoginForm
      branding={branding}
      externalProviders={externalProviders}
      clientId={clientId}
      redirectUri={redirectUri}
      state={state}
    />
  )
}
