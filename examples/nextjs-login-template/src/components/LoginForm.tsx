'use client'

import { useState, FormEvent } from 'react'
import { BrandingConfig, ExternalProvider } from '@/lib/types'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  branding: BrandingConfig
  externalProviders?: ExternalProvider[]
  clientId: string
  redirectUri: string
  state?: string
}

export default function LoginForm({
  branding,
  externalProviders = [],
  clientId,
  redirectUri,
  state,
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_SYAUTH_API_URL

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Authenticate user with SyAuth
      const response = await fetch(`${apiUrl}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store the JWT token
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token)
        }
      }

      // Wait a moment for storage to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verify we're authenticated before redirecting
      try {
        const profileCheck = await fetch(`${apiUrl}/user/profile/`, {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
        })
        
        if (!profileCheck.ok) {
          throw new Error(`Session not established (${profileCheck.status}). Please try logging in again.`)
        }
      } catch (err) {
        throw new Error('Failed to establish session. Please try again.')
      }

      // After successful login, redirect to the final destination
      // The redirectUri is where the user wanted to go (e.g., the app)
      if (redirectUri) {
        window.location.href = redirectUri
      } else {
        // If no redirect URI, go to profile page
        window.location.href = '/profile'
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
      setLoading(false)
    }
  }

  const handleSocialLogin = (providerType: string) => {
    // Redirect to OAuth provider
    const socialLoginUrl = new URL(`${apiUrl}/oauth/${providerType}/`)
    socialLoginUrl.searchParams.set('client_id', clientId)
    
    // Use provided redirectUri or fallback to current origin + /profile
    const finalRedirectUri = redirectUri || `${window.location.origin}/profile`
    socialLoginUrl.searchParams.set('redirect_uri', finalRedirectUri)
    
    if (state) {
      socialLoginUrl.searchParams.set('state', state)
    }

    window.location.href = socialLoginUrl.toString()
  }

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: branding.background_color,
      }}
      data-theme={branding.theme}
    >
      <style jsx global>{`
        :root {
          --primary-color: ${branding.primary_color};
          --secondary-color: ${branding.secondary_color};
          --background-color: ${branding.background_color};
        }
      `}</style>

      <div className={styles.card}>
        {/* Logo and Company Name */}
        <div className={styles.header}>
          {branding.logo_url && (
            <img
              src={branding.logo_url}
              alt={branding.company_name || 'Logo'}
              className={styles.logo}
            />
          )}
          {branding.company_name && (
            <h1 className={styles.companyName}>{branding.company_name}</h1>
          )}
          <h2 className={styles.title}>Sign In</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {/* Social Login Buttons */}
        {branding.show_social_logins && externalProviders.length > 0 && (
          <div className={styles.socialLogins}>
            {externalProviders.map((provider) => (
              <button
                key={provider.id}
                type="button"
                className={styles.socialBtn}
                onClick={() => handleSocialLogin(provider.provider_type)}
              >
                <span className={styles.socialIcon}>
                  {provider.provider_type === 'google' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {provider.provider_type === 'github' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.42 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  )}
                  {provider.provider_type === 'linkedin' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  {provider.provider_type === 'facebook' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                </span>
                Continue with {
                  provider.provider_type === 'google' ? 'Google' :
                  provider.provider_type === 'github' ? 'GitHub' :
                  provider.provider_type === 'linkedin' ? 'LinkedIn' :
                  provider.provider_type === 'facebook' ? 'Facebook' :
                  provider.name
                }
              </button>
            ))}
            <div className={styles.divider}>
              <span>or</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <a
                href={`/forgot-password?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}${state ? `&state=${state}` : ''}`}
                className={styles.link}
                style={{ fontSize: '0.875rem', color: branding.primary_color }}
              >
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Registration Link */}
        <div className={styles.footer} style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Don't have an account?{' '}
          <a
            href={`/register?client_id=${clientId}&redirect_uri=${encodeURIComponent(
              redirectUri
            )}${state ? `&state=${state}` : ''}`}
            className={styles.link}
            style={{ color: branding.primary_color, fontWeight: '500' }}
          >
            Create Account
          </a>
        </div>

        {/* Footer Links */}
        <div className={styles.footer}>
          {branding.terms_url && (
            <a href={branding.terms_url} className={styles.link} target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
          )}
          {branding.privacy_url && (
            <>
              {branding.terms_url && <span className={styles.separator}>•</span>}
              <a href={branding.privacy_url} className={styles.link} target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
