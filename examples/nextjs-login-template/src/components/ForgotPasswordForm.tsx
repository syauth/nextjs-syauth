'use client'

import { useState, FormEvent } from 'react'
import { BrandingConfig } from '@/lib/types'
import styles from './LoginForm.module.css'

interface ForgotPasswordFormProps {
  branding: BrandingConfig
  clientId: string
  redirectUri: string
  state?: string
}

export default function ForgotPasswordForm({
  branding,
  clientId,
  redirectUri,
  state,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_SYAUTH_API_URL

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/password/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          oauth_client: clientId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request password reset')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
          <div className={styles.header}>
            {branding.logo_url && (
              <img
                src={branding.logo_url}
                alt={branding.company_name || 'Logo'}
                className={styles.logo}
              />
            )}
            <h2 className={styles.title}>Check Your Email</h2>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#4a5568' }}>
            <p>
              If an account exists for <strong>{email}</strong>, we have sent a password reset code.
            </p>
          </div>

          <div className={styles.footer}>
            <a
              href={`/reset-password?email=${encodeURIComponent(email)}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}${state ? `&state=${state}` : ''}`}
              className={styles.submitBtn}
              style={{ 
                display: 'block', 
                textDecoration: 'none', 
                textAlign: 'center',
                backgroundColor: branding.primary_color,
                color: '#ffffff'
              }}
            >
              Enter Reset Code
            </a>
          </div>
          
          <div className={styles.footer} style={{ marginTop: '1rem', textAlign: 'center' }}>
            <a
              href={`/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}${state ? `&state=${state}` : ''}`}
              className={styles.link}
              style={{ color: branding.primary_color }}
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    )
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
        <div className={styles.header}>
          {branding.logo_url && (
            <img
              src={branding.logo_url}
              alt={branding.company_name || 'Logo'}
              className={styles.logo}
            />
          )}
          <h2 className={styles.title}>Reset Password</h2>
          <p style={{ marginTop: '0.5rem', color: '#718096' }}>
            Enter your email to receive a reset code
          </p>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

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

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>

        <div className={styles.footer} style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href={`/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}${state ? `&state=${state}` : ''}`}
            className={styles.link}
            style={{ color: branding.primary_color }}
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}
