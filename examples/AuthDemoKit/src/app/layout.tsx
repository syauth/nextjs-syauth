'use client'

import React from 'react'
import { SyAuthProvider } from 'nextjs-syauth'
import syAuthClient from '@/syauth.config'
import Header from '@/components/Header'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Container } from 'react-bootstrap'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <SyAuthProvider
          authClient={syAuthClient}
          redirectAfterLogin='/dashboard'
          unauthorizedRedirect='/login'
        >
          <Header />
          <Container>{children}</Container>
        </SyAuthProvider>
      </body>
    </html>
  )
}
