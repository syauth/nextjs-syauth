'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SyAuth, {
  AuthUser,
  RegisterData,
  PasswordResetConfirmData,
  VerificationResponse,
  PasswordResetResponse,
  ProfileUpdateData,
} from './client'

// Context type
interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  authClient: SyAuth
  login: (
    email: string,
    password: string,
    remember_me?: boolean
  ) => Promise<void>
  logout: () => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  updateProfile: (data: ProfileUpdateData) => Promise<AuthUser>
  verifyEmail: (email: string, code: string) => Promise<VerificationResponse>
  requestVerificationCode: (email: string) => Promise<VerificationResponse>
  requestPasswordReset: (email: string) => Promise<PasswordResetResponse>
  confirmPasswordReset: (
    data: PasswordResetConfirmData
  ) => Promise<PasswordResetResponse>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider props
interface AuthProviderProps {
  children: React.ReactNode
  authClient: SyAuth
  redirectAfterLogin?: string
  unauthorizedRedirect?: string
}

// Auth provider component
export const SyAuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authClient,
  redirectAfterLogin = '/dashboard',
  unauthorizedRedirect = '/login',
}) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)

        // First check if we already have a user in storage
        const storedUser = authClient.getUser()
        if (storedUser) {
          setUser(storedUser)
          setIsAuthenticated(true)
        }

        // Then try to fetch the latest profile
        const userData = await authClient.getProfile()
        if (userData) {
          setUser(userData)
          setIsAuthenticated(true)
        } else if (!storedUser) {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [authClient])

  // Login function
  const login = async (
    email: string,
    password: string,
    remember_me: boolean = false
  ) => {
    try {
      setLoading(true)
      setError(null)

      const userData = await authClient.login(email, password, remember_me)
      setUser(userData)
      setIsAuthenticated(true)

      // Check for return_to parameter in URL
      let returnTo = redirectAfterLogin
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const returnToParam = params.get('return_to')
        if (returnToParam) {
          returnTo = returnToParam
        }
      }

      router.push(returnTo)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setLoading(true)
      await authClient.logout()
      setUser(null)
      setIsAuthenticated(false)
      router.push(unauthorizedRedirect)
    } catch (err) {
      console.error('Logout error:', err)
      setUser(null)
      setIsAuthenticated(false)
      router.push(unauthorizedRedirect)
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true)
      setError(null)
      await authClient.register(userData)
      router.push(
        `/verify-email?email=${encodeURIComponent(
          userData.email
        )}&registered=true`
      )
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Email verification
  const verifyEmail = async (email: string, code: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await authClient.verifyEmail(email, code)

      // After successful verification, redirect to login
      router.push(`/login?verified=true&email=${encodeURIComponent(email)}`)

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Verification failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Request verification code
  const requestVerificationCode = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      return await authClient.requestVerificationCode(email)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to resend verification code'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Password reset request
  const requestPasswordReset = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await authClient.requestPasswordReset(email)

      // After successful request, redirect to reset confirmation page
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Password reset request failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Confirm password reset
  const confirmPasswordReset = async (data: PasswordResetConfirmData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await authClient.confirmPasswordReset(data)

      // After successful reset, redirect to login with success message
      router.push(`/login?reset=true&email=${encodeURIComponent(data.email)}`)

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Password reset confirmation failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      setLoading(true)
      setError(null)
      const updatedUser = await authClient.updateProfile(data)
      setUser(updatedUser)
      return updatedUser
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Profile update failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }
  // Hook for handling unauthorized access - redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Only redirect on client-side and only from protected pages
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname

        // Check if the current path is in a protected route pattern
        const isProtectedPath = [
          '/dashboard',
          '/profile',
          '/settings',
          '/account',
        ].some(
          (protectedPath) =>
            pathname === protectedPath ||
            pathname.startsWith(`${protectedPath}/`)
        )

        if (isProtectedPath) {
          const returnPath = encodeURIComponent(
            pathname + window.location.search
          )
          router.push(`${unauthorizedRedirect}?return_to=${returnPath}`)
        }
      }
    }
  }, [loading, isAuthenticated, router, unauthorizedRedirect])

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    authClient,
    login,
    logout,
    register,
    verifyEmail,
    requestVerificationCode,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useSyAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSyAuth must be used within a SyAuthProvider')
  }
  return context
}
