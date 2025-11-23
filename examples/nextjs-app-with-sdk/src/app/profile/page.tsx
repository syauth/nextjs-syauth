'use client'

import { useSyAuth } from '@syauth/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, FormEvent } from 'react'

export default function ProfilePage() {
  const { user, isAuthenticated, loading, updateProfile, logout } = useSyAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '')
      setLastName(user.last_name || '')
    }
  }, [user])

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
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
          <h1 style={{ marginBottom: '0.5rem' }}>Profile Settings</h1>
          <p style={{ color: '#666' }}>Update your account information</p>
        </div>

        {success && (
          <div className="success">
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                }}
              />
              <small style={{ color: '#666', fontSize: '0.85rem' }}>
                Email cannot be changed
              </small>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={updating}
                className="button button-primary"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="button button-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
