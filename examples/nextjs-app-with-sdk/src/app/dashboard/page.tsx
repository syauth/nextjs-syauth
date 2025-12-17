'use client'

import { useSyAuth } from '@syauth/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isAuthenticated, loading, logout } = useSyAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Check for auth_status cookie before redirecting
      const hasAuthStatusCookie = document.cookie.includes('auth_status=')
      if (!hasAuthStatusCookie) {
        router.push('/')
      }
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div>
      <nav className="nav">
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>My App</div>
        <div className="nav-links">
          <a href="/dashboard">Dashboard</a>
          <a href="/profile">Profile</a>
          <button onClick={handleLogout} className="button button-secondary">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <h1 style={{ marginBottom: '1rem' }}>Dashboard</h1>
          <p style={{ color: '#666' }}>Welcome back, {user.first_name || user.email}!</p>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>User Information</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 'bold', width: '200px' }}>
                  Email
                </td>
                <td style={{ padding: '0.75rem 0' }}>{user.email}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>First Name</td>
                <td style={{ padding: '0.75rem 0' }}>{user.first_name || 'N/A'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>Last Name</td>
                <td style={{ padding: '0.75rem 0' }}>{user.last_name || 'N/A'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>User ID</td>
                <td style={{ padding: '0.75rem 0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {user.id}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>Email Verified</td>
                <td style={{ padding: '0.75rem 0' }}>
                  {user.email_verified ? (
                    <span style={{ color: '#22c55e' }}>✓ Verified</span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>✗ Not Verified</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/profile')}
              className="button button-primary"
            >
              Edit Profile
            </button>
            <button className="button button-secondary">
              View Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
