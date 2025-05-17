// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SignInError extends Error {
  message: string
}

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = () => {
    try {
      setGoogleLoading(true)
      setError(null)

      // Get the backend URL and OAuth client ID from environment variables
      const oauthBackendUrl = process.env.OAUTH_ISSUER_URL
      const clientId = process.env.OAUTH_CLIENT_ID

      if (!oauthBackendUrl) {
        throw new Error(
          'Backend URL is not defined. Check your environment variables.'
        )
      }

      if (!clientId) {
        throw new Error(
          'OAuth Client ID is not defined. Check your environment variables.'
        )
      }

      // Create the callback URL for our NextAuth endpoint
      const callbackUrl = `${window.location.origin}/api/auth/callback/django`

      // Redirect to the backend's Google OAuth endpoint
      const redirectUrl = `${oauthBackendUrl}/api/e/v1/oauth/google/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        callbackUrl
      )}`

      // Perform the redirect
      window.location.href = redirectUrl
    } catch (err: unknown) {
      setGoogleLoading(false)
      const error = err as SignInError
      console.error('GOOGLE SIGN IN ERROR:', error)
      setError(`Google Sign In Error: ${error.message || 'Unknown error'}`)
    }
  }

  return (
    <main className='flex min-h-[80vh] flex-col items-center justify-center p-8'>
      <div className='max-w-md w-full p-8 space-y-8 bg-white rounded-lg shadow-lg'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Login</h1>
          <p className='mt-2 text-gray-600'>Sign in to your account</p>
        </div>

        {error && (
          <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-4'>
            <p className='text-red-700'>{error}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {googleLoading ? (
            <>
              <div className='animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full mr-2'></div>
              Connecting...
            </>
          ) : (
            <>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 48 48'
                width='24px'
                height='24px'
              >
                <path
                  fill='#FFC107'
                  d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'
                />
                <path
                  fill='#FF3D00'
                  d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'
                />
                <path
                  fill='#4CAF50'
                  d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'
                />
                <path
                  fill='#1976D2'
                  d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'
                />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <div className='text-center mt-6'>
          <Link
            href='/'
            className='text-blue-500 hover:underline'
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
