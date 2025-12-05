'use client'

import { useState, FormEvent } from 'react'
import { BrandingConfig } from '@/lib/types'
import styles from './LoginForm.module.css'

interface ResetPasswordFormProps {
  branding: BrandingConfig
  clientId: string
  redirectUri: string
  state?: string
  initialEmail?: string
  initialCode?: string
}

export default function ResetPasswordForm({
  branding,
  clientId,
  redirectUri,
  state,
  initialEmail = '',
  initialCode = '',
}: ResetPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState(initialCode)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_SYAUTH_API_URL

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/password/reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          new_password: newPassword,
          confirm_password: confirmPassword,
          oauth_client: clientId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
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
            <h2 className={styles.title}>Password Reset Successful</h2>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#48bb78' }}>
            <p>Your password has been successfully updated.</p>
          </div>

          <div className={styles.footer}>
            <a
              href={`/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}${state ? `&state=${state}` : ''}`}
              className={styles.submitBtn}
              style={{ 
                display: 'block', 
                textDecoration: 'none', 
                textAlign: 'center',
                backgroundColor: branding.primary_color,
                color: '#ffffff'
              }}
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
          <h2 className={styles.title}>Set New Password</h2>
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
              disabled={loading || !!initialEmail}
              readOnly={!!initialEmail}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="code" className={styles.label}>
              Reset Code
            </label>
            <input
              id="code"
              type="text"
              className={styles.input}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code from email"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
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

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
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
