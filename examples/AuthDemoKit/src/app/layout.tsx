'use client'

import React from 'react'
import { NexoAuthProvider } from 'nextjs-nexoauth'
import nexoAuthClient from '@/nexoauth.config'
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
        <NexoAuthProvider
          authClient={nexoAuthClient}
          redirectAfterLogin='/dashboard'
          unauthorizedRedirect='/login'
        >
          <Header />
          <Container>{children}</Container>
        </NexoAuthProvider>
      </body>
    </html>
  )
}
