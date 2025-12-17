'use client'

import { Suspense } from 'react'
import ProfileForm from './ProfileForm'

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileForm />
    </Suspense>
  )
}
