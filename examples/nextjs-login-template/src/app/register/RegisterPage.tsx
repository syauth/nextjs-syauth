'use client'

import { useSearchParams } from 'next/navigation'
import RegisterForm from '@/components/RegisterForm'
import { useState, useEffect } from 'react'
import { BrandingConfig, ExternalProvider } from '@/lib/types'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const [branding, setBranding] = useState<BrandingConfig | null>(null)
  const [externalProviders, setExternalProviders] = useState<ExternalProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get OAuth parameters from URL
  const clientId = searchParams.get('client_id') || process.env.NEXT_PUBLIC_SYAUTH_CLIENT_ID || ''
  const redirectUri = searchParams.get('redirect_uri') || process.env.NEXT_PUBLIC_LOGIN_URL || ''
  const state = searchParams.get('state') || undefined

  useEffect(() => {
    if (!clientId) {
      setError('Missing required OAuth client_id parameter')
      setLoading(false)
      return
    }

    // Fetch branding configuration
    const fetchBranding = async () => {
      try {
        const response = await fetch(`/api/branding?client_id=${clientId}`)
        if (!response.ok) {
          throw new Error('Failed to load branding')
        }
        const data = await response.json()
        setBranding(data)
        setExternalProviders([])
      } catch (err) {

        setError('Failed to load configuration')
      } finally {
        setLoading(false)
      }
    }

    fetchBranding()
  }, [clientId, redirectUri])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading...</p>
      </div>
    )
  }

  if (error || !branding) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#c33' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
        <p>{error || 'Failed to load configuration'}</p>
      </div>
    )
  }

  return (
    <RegisterForm
      branding={branding}
      externalProviders={externalProviders}
      clientId={clientId}
      redirectUri={redirectUri}
      state={state}
    />
  )
}
