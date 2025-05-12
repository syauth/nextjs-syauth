'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

interface DebugInfo {
  error?: string
  url?: string | null
  status?: number
  ok?: boolean
}

interface SignInError extends Error {
  message: string
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log('=== BEGINNING SIGN IN PROCESS ===')

      // Make signIn call with detailed error handling
      const result = await signIn('django', {
        callbackUrl: '/welcome',
        redirect: false, // Don't redirect so we can debug
      })

      console.log('SIGN IN RESULT:', result)
      setDebugInfo(result)

      if (result?.error) {
        setError(`Error: ${result.error}`)
      } else if (result?.url) {
        console.log('SUCCESS - REDIRECTING TO:', result.url)
        window.location.href = result.url
      }
    } catch (err: unknown) {
      console.error('SIGN IN ERROR:', err)
      const error = err as SignInError
      setError(`Error: ${error.message || 'Unknown error'}`)
      setDebugInfo(err as DebugInfo)
    } finally {
      setLoading(false)
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

        <button
          onClick={handleLogin}
          disabled={loading}
          className='w-full px-4 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition'
        >
          {loading ? 'Connecting...' : 'Sign in with SyAuth'}
        </button>

        {debugInfo && (
          <div className='mt-4 p-4 bg-gray-50 border border-gray-200 rounded'>
            <h3 className='font-bold text-sm mb-2'>Debug Information:</h3>
            <pre className='text-xs overflow-auto max-h-40'>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className='text-center mt-4'>
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
