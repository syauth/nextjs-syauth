'use client'

import { useSyAuth } from '@syauth/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { isAuthenticated, loading, loginWithRedirect } = useSyAuth()
  const router = useRouter()

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Welcome to My App
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          Secure authentication powered by SyAuth
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => loginWithRedirect()}
            className="button button-primary"
            style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/register')}
            className="button button-secondary"
            style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
          >
            Create Account
          </button>
        </div>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
          <p>This app uses SyAuth SDK for authentication</p>
          <p>Sign in with OAuth or create a new account</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Features</h2>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
          <li>OAuth 2.0 Authorization Code Flow with PKCE</li>
          <li>Secure token management</li>
          <li>Protected routes with middleware</li>
          <li>User profile management</li>
          <li>Easy integration with SyAuth SDK</li>
        </ul>
      </div>
    </div>
  )
}
