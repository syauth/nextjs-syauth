'use client'

import { useState, FormEvent } from 'react'
import { BrandingConfig, ExternalProvider } from '@/lib/types'
import styles from './LoginForm.module.css'

interface RegisterFormProps {
  branding: BrandingConfig
  externalProviders?: ExternalProvider[]
  clientId: string
  redirectUri: string
  state?: string
}

export default function RegisterForm({
  branding,
  externalProviders,
  clientId,
  redirectUri,
  state,
}: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_S0011_API_URL
  const apiKey = process.env.NEXT_PUBLIC_SYAUTH_API_KEY

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validation
    if (!email || !password || !firstName || !lastName) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${apiUrl}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-API-Key': apiKey }), // Add API key if configured
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          oauth_client: clientId, // Required for backend association
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed')
      }

      setSuccess(true)

      // Wait 2 seconds then redirect to login
      setTimeout(() => {
        window.location.href = `/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}${state ? `&state=${state}` : ''}&registered=true`
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: ExternalProvider) => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      provider: provider.provider_name,
    })

    if (state) {
      params.append('state', state)
    }

    window.location.href = `${apiUrl}/oauth/authorize/?${params.toString()}`
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo */}
        {branding.logo_url && (
          <div className={styles.logoContainer}>
            <img
              src={branding.logo_url}
              alt={branding.company_name || 'Logo'}
              className={styles.logo}
            />
          </div>
        )}

        {/* Title */}
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Sign up for {branding.company_name || 'our service'}</p>

        {/* Success Message */}
        {success && (
          <div className={styles.success}>
            Account created successfully! Redirecting to login...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={styles.input}
              disabled={loading || success}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="John"
                className={styles.input}
                disabled={loading || success}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Doe"
                className={styles.input}
                disabled={loading || success}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordContainer}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                className={styles.input}
                disabled={loading || success}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
                disabled={loading || success}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              className={styles.input}
              disabled={loading || success}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className={styles.submitButton}
            style={{
              backgroundColor: branding.primary_color,
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Social Login */}
        {branding.show_social_logins && externalProviders && externalProviders.length > 0 && (
          <>
            <div className={styles.divider}>
              <span>or continue with</span>
            </div>

            <div className={styles.socialButtons}>
              {externalProviders.map((provider) => (
                <button
                  key={provider.provider_name}
                  onClick={() => handleSocialLogin(provider)}
                  disabled={loading || success}
                  className={styles.socialButton}
                  title={`Sign up with ${provider.provider_name}`}
                >
                  {provider.provider_name === 'google' && '🔵'}
                  {provider.provider_name === 'github' && '⚫'}
                  {provider.provider_name === 'linkedin' && '🔷'}
                  {provider.provider_name === 'facebook' && '🔵'}
                  {!['google', 'github', 'linkedin', 'facebook'].includes(provider.provider_name) &&
                    '🔐'}
                  <span>{provider.provider_name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Login Link */}
        <div className={styles.footer}>
          Already have an account?{' '}
          <a
            href={`/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
              redirectUri
            )}${state ? `&state=${state}` : ''}`}
            className={styles.link}
            style={{ color: branding.primary_color }}
          >
            Sign In
          </a>
        </div>

        {/* Terms and Privacy */}
        {(branding.terms_url || branding.privacy_url) && (
          <div className={styles.legal}>
            By creating an account, you agree to our{' '}
            {branding.terms_url && (
              <a href={branding.terms_url} target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
            )}
            {branding.terms_url && branding.privacy_url && ' and '}
            {branding.privacy_url && (
              <a href={branding.privacy_url} target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
