'use client'

import { useOAuthCallback } from '@syauth/nextjs'

/**
 * Handles OAuth callback using the SDK's useOAuthCallback hook
 * This hook automatically:
 * 1. Parses the authorization code from URL
 * 2. Exchanges it for an access token
 * 3. Retrieves user profile
 * 4. Redirects to the original destination
 */
export default function CallbackHandler() {
  const { loading, error, success } = useOAuthCallback()

  if (loading) {
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

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', marginTop: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <h2>Authentication Failed</h2>
          <div className="error" style={{ marginTop: '1rem', textAlign: 'left' }}>
            {error}
          </div>
          <a href="/" className="button button-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Return Home
          </a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', marginTop: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
          <h2>Success!</h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Redirecting you now...
          </p>
        </div>
      </div>
    )
  }

  return null
}
