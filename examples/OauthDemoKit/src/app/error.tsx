'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh] p-8'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-8'>
        <h2 className='text-2xl font-bold text-red-600 mb-4'>
          Something went wrong!
        </h2>
        <p className='text-gray-800 mb-6'>
          {error.message || 'An unexpected error occurred'}
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button
            onClick={reset}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Try again
          </button>
          <Link
            href='/'
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-center'
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
