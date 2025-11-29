'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/components/LoginForm.module.css'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  email_verified: boolean
  company?: string
  job_title?: string
  phone_number?: string
  country?: string
}

export default function ProfileForm() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Profile fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  // Password change fields
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const apiUrl = process.env.NEXT_PUBLIC_S0011_API_URL

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        // No token, redirect to login
        router.push('/')
        return
      }

      const response = await fetch(`${apiUrl}/user/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token invalid or expired, clear and redirect to login
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          router.push('/')
          return
        }
        throw new Error('Failed to load profile')
      }

      const data = await response.json()
      setUser(data)
      setFirstName(data.first_name || '')
      setLastName(data.last_name || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/user/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update profile')
      }

      setUser(data)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/user/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to change password')
      }

      setSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordChange(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      await fetch(`${apiUrl}/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (err) {
      // Ignore logout errors
    } finally {
      // Clear tokens
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.companyName}>Loading...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: '600px' }}>
        <div className={styles.header}>
          <h1 className={styles.companyName}>My Profile</h1>
          <p className={styles.title}>{user.email}</p>
        </div>

        {success && (
          <div className={styles.success}>
            {success}
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Profile Information */}
        <form onSubmit={handleProfileUpdate} className={styles.form}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>
            Profile Information
          </h3>

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
                className={styles.input}
                disabled={saving}
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
                className={styles.input}
                disabled={saving}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={styles.submitBtn}
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>

        {/* Password Change Section */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              className={styles.link}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className={styles.form}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>
                Change Password
              </h3>

              <div className={styles.formGroup}>
                <label htmlFor="currentPassword" className={styles.label}>
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.input}
                  disabled={saving}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  disabled={saving}
                  required
                  placeholder="At least 8 characters"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  disabled={saving}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.submitBtn}
                  style={{ flex: 1 }}
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordChange(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setError(null)
                  }}
                  className={styles.submitBtn}
                  style={{
                    flex: 1,
                    background: '#6b7280',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Logout Button */}
        <div className={styles.footer} style={{ marginTop: '2rem' }}>
          <button
            onClick={handleLogout}
            className={styles.link}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
