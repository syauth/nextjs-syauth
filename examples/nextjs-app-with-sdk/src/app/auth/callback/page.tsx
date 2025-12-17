'use client'

import { Suspense } from 'react'
import CallbackHandler from './CallbackHandler'

/**
 * OAuth Callback Page
 * This page handles the redirect from the SyAuth login page
 */
export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="loading">Processing authentication...</div>}>
      <CallbackHandler />
    </Suspense>
  )
}
