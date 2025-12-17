'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ResetPasswordForm from '@/components/ResetPasswordForm'
import { BrandingConfig } from '@/lib/types'
import { getBrandingFromEnv, mergeBranding } from '@/lib/branding'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const [branding, setBranding] = useState<BrandingConfig | null>(null)
  const [loading, setLoading] = useState(true)

  // Get OAuth parameters from URL
  const clientId = searchParams.get('client_id') || process.env.NEXT_PUBLIC_SYAUTH_CLIENT_ID || ''
  const redirectUri = searchParams.get('redirect_uri') || ''
  const state = searchParams.get('state') || ''
  
  // Get reset parameters
  const email = searchParams.get('email') || ''
  const code = searchParams.get('code') || ''

  useEffect(() => {
    const loadBranding = async () => {
      try {
        setLoading(true)

        // Fetch branding from API route
        const response = await fetch(`/api/branding?client_id=${clientId}`)

        if (response.ok) {
          const data = await response.json()
          
          if (data.branding) {
            setBranding(data.branding)
          } else {
            setBranding(data)
          }
        } else {
          // Fallback to env-only branding
          const envBranding = getBrandingFromEnv()
          const fallbackBranding = mergeBranding(null, envBranding)
          setBranding(fallbackBranding)
        }
      } catch (err) {
        // Fallback to env-only branding
        const envBranding = getBrandingFromEnv()
        const fallbackBranding = mergeBranding(null, envBranding)
        setBranding(fallbackBranding)
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

  if (!branding) {
    return null
  }

  return (
    <ResetPasswordForm
      branding={branding}
      clientId={clientId}
      redirectUri={redirectUri}
      state={state}
      initialEmail={email}
      initialCode={code}
    />
  )
}
