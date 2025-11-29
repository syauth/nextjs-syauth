'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from '@/components/LoginForm.module.css'

export default function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const clientId = searchParams.get('client_id') || process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || ''
  const redirectUri = searchParams.get('redirect_uri') || process.env.NEXT_PUBLIC_LOGIN_URL || ''
  const state = searchParams.get('state') || ''
  const apiUrl = process.env.NEXT_PUBLIC_S0011_API_URL

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/email/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          oauth_client: clientId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Verification failed')
      }

      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = `/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}${state ? `&state=${state}` : ''}&verified=true`
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendMessage(null)
    setResendLoading(true)

    try {
      const response = await fetch(`${apiUrl}/email/verify/resend/`, {
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
        throw new Error(data.error || data.message || 'Failed to resend code')
      }

      setResendMessage('Verification code sent! Check your email.')
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.companyName}>Verify Your Email</h1>
          <p className={styles.title}>
            We sent a verification code to <strong>{email}</strong>
          </p>
        </div>

        {success && (
          <div className={styles.success}>
            Email verified successfully! Redirecting to login...
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {resendMessage && (
          <div className={resendMessage.includes('sent') ? styles.success : styles.error}>
            {resendMessage}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={styles.input}
              disabled={loading || success}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="code" className={styles.label}>
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Enter 6-digit code"
              className={styles.input}
              disabled={loading || success}
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className={styles.submitBtn}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className={styles.footer} style={{ marginTop: '1.5rem', flexDirection: 'column', gap: '1rem' }}>
          <div>
            Didn't receive the code?{' '}
            <button
              onClick={handleResendCode}
              disabled={resendLoading || success}
              className={styles.link}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
          <div>
            <a
              href={`/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
                redirectUri
              )}${state ? `&state=${state}` : ''}`}
              className={styles.link}
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
