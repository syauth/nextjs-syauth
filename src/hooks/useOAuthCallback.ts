'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSyAuth } from '../react'

export interface UseOAuthCallbackResult {
  loading: boolean
  error: string | null
  success: boolean
}

/**
 * Hook to handle OAuth callback
 * Automatically parses URL parameters and exchanges code for token
 *
 * Usage:
 * ```tsx
 * const { loading, error, success } = useOAuthCallback()
 * ```
 */
export function useOAuthCallback(): UseOAuthCallbackResult {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const { handleOAuthCallback } = useSyAuth()

  useEffect(() => {
    let cancelled = false

    const processCallback = async () => {
      // Get code and state from URL
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      // Handle error from authorization server
      if (errorParam) {
        const errorMsg =
          errorDescription ||
          `Authorization failed: ${errorParam}`
        if (!cancelled) {
          setError(errorMsg)
          setLoading(false)
        }
        return
      }

      // Validate required parameters
      if (!code || !state) {
        if (!cancelled) {
          setError('Missing authorization code or state parameter')
          setLoading(false)
        }
        return
      }

      try {
        // Handle the callback (exchange code for token)
        await handleOAuthCallback({ code, state })
        if (!cancelled) {
          setSuccess(true)
        }
        // Navigation is handled by the context provider
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to complete authentication'
        if (!cancelled) {
          setError(errorMessage)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    processCallback()

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true
    }
  }, [searchParams, handleOAuthCallback, router])

  return { loading, error, success }
}
