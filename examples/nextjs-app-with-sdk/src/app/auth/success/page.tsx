'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * Auth Success Page
 * 
 * This page receives tokens via URL hash (for security, hash is never sent to server)
 * and sets them as cookies on the client side.
 * 
 * This works around cross-origin cookie issues when using proxies like ngrok.
 */
export default function AuthSuccessPage() {
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    try {
      // Get redirect destination from query params
      const redirectPath = searchParams.get('redirect') || '/dashboard'
      
      // Get tokens from URL hash
      const hash = window.location.hash
      const tokenMatch = hash.match(/tokens=([^&]+)/)
      
      if (!tokenMatch) {
        setError('No authentication tokens received')
        return
      }

      // Decode tokens
      const encodedTokens = tokenMatch[1]
      const tokenData = JSON.parse(atob(encodedTokens))

      // Set cookies
      const expiresIn = tokenData.expires_in || 3600
      const expires = new Date(Date.now() + expiresIn * 1000).toUTCString()
      
      // Set auth_status cookie (readable by JS for auth checks)
      document.cookie = `auth_status=authenticated; path=/; expires=${expires}; SameSite=Lax`
      
      // Store tokens in localStorage for API calls
      localStorage.setItem('auth_token', tokenData.access_token)
      localStorage.setItem('auth_refresh_token', tokenData.refresh_token || '')
      localStorage.setItem('auth_token_expiry', String(Date.now() + expiresIn * 1000))
      
      // Clear the hash from URL (for security)
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      
      // Redirect to final destination
      router.replace(redirectPath + '?auth_success=true')
    } catch (err) {
      setError('Failed to process authentication')
    }
  }, [searchParams, router])

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', marginTop: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <h2>Authentication Error</h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>{error}</p>
          <a href="/" className="button button-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Return Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
        <h2>Completing authentication...</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Please wait while we set up your session.
        </p>
      </div>
    </div>
  )
}
