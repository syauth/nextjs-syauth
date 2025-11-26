'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import { syAuthConfig } from '@/lib/syauth-config'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')
  const registered = searchParams.get('registered') === 'true'

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!email) {
      setError('Email is required')
      setLoading(false)
      return
    }

    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${syAuthConfig.apiUrl}/email/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: decodeURIComponent(email),
          code,
          oauth_client: syAuthConfig.oauthClientId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendMessage(null)
    setError(null)
    setResending(true)

    if (!email) {
      setError('Email is required')
      setResending(false)
      return
    }

    try {
      const response = await fetch(`${syAuthConfig.apiUrl}/email/verify/resend/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: decodeURIComponent(email),
          oauth_client: syAuthConfig.oauthClientId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

      setResendMessage(data.message || 'Verification code has been resent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ marginBottom: '1rem' }}>Email Verified!</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Your email has been successfully verified. Redirecting to sign in...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h1 style={{ marginBottom: '1rem' }}>Verify Your Email</h1>
          
          {registered && (
            <div className="success" style={{ marginBottom: '1.5rem' }}>
              Registration successful! 🎉
            </div>
          )}

          <p style={{ color: '#666', lineHeight: '1.6' }}>
            {email ? (
              <>
                We've sent a 6-digit verification code to <strong>{decodeURIComponent(email)}</strong>.
                Please enter the code below to activate your account.
              </>
            ) : (
              'Please check your email for a 6-digit verification code to activate your account.'
            )}
          </p>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="success" style={{ marginBottom: '1.5rem' }}>
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="code" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1.5rem',
                textAlign: 'center',
                letterSpacing: '0.5rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
              }}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="button button-primary" 
            style={{ width: '100%' }}
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '8px',
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: '#666',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, marginBottom: '0.5rem' }}>
            💡 <strong>Tip:</strong> Can't find the email? Check your spam or junk folder.
          </p>
          <button
            onClick={handleResend}
            disabled={resending}
            style={{
              background: 'none',
              border: 'none',
              color: '#0070f3',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
            }}
          >
            {resending ? 'Sending...' : 'Resend verification code'}
          </button>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
          <a href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>
            ← Back to Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
