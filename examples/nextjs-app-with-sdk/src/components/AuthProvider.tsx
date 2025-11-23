'use client'

import { SyAuthProvider } from '@syauth/nextjs'
import { syAuthConfig } from '@/lib/syauth-config'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SyAuthProvider config={syAuthConfig} redirectAfterLogin="/dashboard">
      {children}
    </SyAuthProvider>
  )
}

