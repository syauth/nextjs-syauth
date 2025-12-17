'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Handles OAuth callback by redirecting to the server-side API route
 * 
 * IMPORTANT: Since we use server-side login (/api/auth/login),
 * we must also use server-side callback (/api/auth/callback)
 * because they share the same session storage (syauth_oauth_session cookie)
 * 
 * Uses window.location.href for redirect to avoid React double-render issues
 */
export default function CallbackHandler() {
  const searchParams = useSearchParams()
  const redirectedRef = useRef(false)

  useEffect(() => {
    // Prevent double redirect (React Strict Mode, Fast Refresh)
    if (redirectedRef.current) {
      return
    }

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle error from authorization server
    if (errorParam) {
      redirectedRef.current = true
      window.location.href = `/auth/error?error=${encodeURIComponent(errorDescription || errorParam)}`
      return
    }

    if (!code || !state) {
      redirectedRef.current = true
      window.location.href = '/auth/error?error=Missing%20code%20or%20state%20parameter'
      return
    }

    // Mark as redirected BEFORE navigating to prevent double calls
    redirectedRef.current = true

    // Use window.location.href for a full page navigation to the API route
    // This prevents React double-render issues and ensures a clean request
    window.location.href = `/api/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
  }, [searchParams])

  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <h2>Completing sign in...</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Please wait while we authenticate you.
        </p>
      </div>
    </div>
  )
}
