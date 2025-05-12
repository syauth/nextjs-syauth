'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatDate } from '../../utils/auth-utils'
import type { Session } from 'next-auth'

// Define the session with extended user fields for TypeScript support
interface ExtendedSession extends Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    company?: string | null
    job_title?: string | null
    phone_number?: string | null
    user_type?: string | null
    created_at?: number | null
    updated_at?: number | null
    last_login?: number | null
  }
}

export default function WelcomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Show loading state during SSR or when status is loading
  if (!isClient || status === 'loading') {
    return (
      <div className='flex min-h-[80vh] items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Cast the session to our extended type with the additional user fields
  const extendedSession = session as ExtendedSession | null
  const user = extendedSession?.user

  return (
    <main className='flex min-h-[80vh] flex-col items-center justify-center p-8'>
      <div className='w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-lg'>
        <h1 className='text-3xl font-bold text-center'>Welcome!</h1>

        {user ? (
          <div className='space-y-6'>
            <div className='text-center'>
              <p className='text-xl mb-2'>Hello, {user.name || user.email}!</p>
              <p className='text-gray-600'>
                You are now authenticated via SyAuth
              </p>
            </div>

            <div className='border-t border-gray-200 pt-6'>
              <h2 className='text-lg font-semibold mb-4'>Your Profile:</h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                {/* Basic Info */}
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-medium text-gray-700 mb-2'>
                    Basic Information
                  </h3>
                  <ul className='space-y-2'>
                    <li>
                      <span className='font-medium'>Name:</span>{' '}
                      {user.name || 'N/A'}
                    </li>
                    <li>
                      <span className='font-medium'>Email:</span>{' '}
                      {user.email || 'N/A'}
                    </li>
                    <li>
                      <span className='font-medium'>ID:</span>{' '}
                      {user.id || 'N/A'}
                    </li>
                    <li>
                      <span className='font-medium'>User Type:</span>{' '}
                      {user.user_type || 'N/A'}
                    </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-medium text-gray-700 mb-2'>
                    Contact & Work
                  </h3>
                  <ul className='space-y-2'>
                    <li>
                      <span className='font-medium'>Company:</span>{' '}
                      {user.company || 'N/A'}
                    </li>
                    <li>
                      <span className='font-medium'>Job Title:</span>{' '}
                      {user.job_title || 'N/A'}
                    </li>
                    <li>
                      <span className='font-medium'>Phone:</span>{' '}
                      {user.phone_number || 'N/A'}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Account Activity */}
              <div className='bg-gray-50 p-4 rounded-lg mb-6'>
                <h3 className='font-medium text-gray-700 mb-2'>
                  Account Activity
                </h3>
                <ul className='space-y-2'>
                  <li>
                    <span className='font-medium'>Created:</span>{' '}
                    {formatDate(user.created_at)}
                  </li>
                  <li>
                    <span className='font-medium'>Last Updated:</span>{' '}
                    {formatDate(user.updated_at)}
                  </li>
                  <li>
                    <span className='font-medium'>Last Login:</span>{' '}
                    {formatDate(user.last_login)}
                  </li>
                </ul>
              </div>

              {/* Raw Data */}
              <div className='bg-gray-50 p-4 rounded-lg overflow-auto'>
                <h3 className='font-medium text-gray-700 mb-2'>
                  Complete Profile Data
                </h3>
                <pre className='text-sm overflow-x-auto'>
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>

            <div className='pt-4'>
              <button
                onClick={handleLogout}
                className='w-full px-4 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition'
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <p className='text-center text-red-500'>Not authenticated</p>
        )}
      </div>
    </main>
  )
}
