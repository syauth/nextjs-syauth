'use client'

import { useEffect, useState, useRef } from 'react'
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
  
  // Use ref to prevent multiple simultaneous requests (React Strict Mode, Fast Refresh)
  const processingRef = useRef(false)
  const processedRef = useRef(false)

  useEffect(() => {
    // Skip if already processing or processed
    if (processingRef.current || processedRef.current) {
      return
    }

    let cancelled = false

    const processCallback = async () => {
      // Double-check to prevent race conditions
      if (processingRef.current || processedRef.current) {
        return
      }

      processingRef.current = true

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
          processedRef.current = true
        }
        return
      }

      // Validate required parameters
      if (!code || !state) {
        if (!cancelled) {
          setError('Missing authorization code or state parameter')
          setLoading(false)
          processedRef.current = true
        }
        return
      }

      try {
        // Handle the callback (exchange code for token)
        await handleOAuthCallback({ code, state })
        if (!cancelled) {
          setSuccess(true)
          processedRef.current = true
        }
        // Navigation is handled by the context provider
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to complete authentication'
        if (!cancelled) {
          setError(errorMessage)
          processedRef.current = true
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
        processingRef.current = false
      }
    }

    processCallback()

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true
    }
    // Only run once when searchParams change, not when handleOAuthCallback changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return { loading, error, success }
}
