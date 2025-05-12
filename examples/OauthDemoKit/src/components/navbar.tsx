'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { getRefreshTokenErrorMessage } from '../utils/auth-utils'
import type { Session } from 'next-auth'

// Define the session type with error field
interface SessionWithError extends Session {
  error?: string
}

export default function Navbar() {
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const sessionWithError = session as SessionWithError | null

  // Token refresh error handling
  useEffect(() => {
    if (sessionWithError?.error === getRefreshTokenErrorMessage()) {
      console.log('Session expired. Redirecting to login...')
      // Sign out the user and redirect to the login page
      signOut({ callbackUrl: '/login' })
    }
  }, [sessionWithError])

  return (
    <nav className='bg-white shadow-md p-4'>
      <div className='max-w-7xl mx-auto flex justify-between items-center'>
        <Link
          href='/'
          className='text-xl font-bold'
        >
          OAuthDemoKit By SyAuth
        </Link>

        <div className='flex gap-4 items-center'>
          <Link
            href='/'
            className='text-gray-700 hover:text-blue-500'
          >
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href='/welcome'
                className='text-gray-700 hover:text-blue-500'
              >
                Welcome
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className='px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600'
              >
                Logout
              </button>
              <div className='ml-4 text-sm text-gray-600'>
                {session?.user?.name || session?.user?.email}
              </div>
            </>
          ) : (
            <Link
              href='/login'
              className='px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600'
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
