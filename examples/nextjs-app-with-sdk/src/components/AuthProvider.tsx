'use client'

import { SyAuth, SyAuthProvider } from '@syauth/nextjs'
import { syAuthConfig } from '@/lib/syauth-config'
import { useMemo } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authClient = useMemo(() => new SyAuth(syAuthConfig), [])
  
  return (
    <SyAuthProvider authClient={authClient} redirectAfterLogin="/dashboard">
      {children}
    </SyAuthProvider>
  )
}

