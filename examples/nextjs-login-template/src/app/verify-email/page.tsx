'use client'

import { Suspense } from 'react'
import VerifyEmailForm from '@/app/verify-email/VerifyEmailForm'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
