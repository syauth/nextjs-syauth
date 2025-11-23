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

  const apiUrl = process.env.NEXT_PUBLIC_S0011_API_URL

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

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      // Redirect to OAuth authorize endpoint
      const authorizeUrl = new URL(`${apiUrl}/oauth/authorize/`)
      authorizeUrl.searchParams.set('client_id', clientId)
      authorizeUrl.searchParams.set('response_type', 'code')
      authorizeUrl.searchParams.set('redirect_uri', redirectUri)
      if (state) {
        authorizeUrl.searchParams.set('state', state)
      }

      window.location.href = authorizeUrl.toString()
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
      setLoading(false)
    }
  }

  const handleSocialLogin = (providerType: string) => {
    // Redirect to OAuth provider
    const socialLoginUrl = new URL(`${apiUrl}/oauth/${providerType}/`)
    socialLoginUrl.searchParams.set('client_id', clientId)
    socialLoginUrl.searchParams.set('redirect_uri', redirectUri)
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
                  {provider.provider_type === 'google' && '🔍'}
                  {provider.provider_type === 'github' && '⚫'}
                  {provider.provider_type === 'linkedin' && '💼'}
                  {provider.provider_type === 'facebook' && '📘'}
                </span>
                Continue with {provider.name}
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
