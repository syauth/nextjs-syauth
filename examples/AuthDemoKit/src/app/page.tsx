'use client'
import React from 'react'
import { Card, Button } from 'react-bootstrap'
import Link from 'next/link'
import AuthStatus from '@/components/AuthStatus'

export default function Home() {
  return (
    <main>
      <h1 className='mb-4'>NexoAuth SDK Test Application</h1>
      <AuthStatus />
      <Card className='mb-4'>
        <Card.Body>
          <Card.Title>Welcome to the NexoAuth Test App</Card.Title>
          <Card.Text>
            This is a minimal application to test the NexoAuth SDK
            functionality. You can use this app to test authentication flows
            including login, registration, password reset, and protected routes.
          </Card.Text>
          <div className='d-flex gap-2'>
            <Link
              href='/login'
              passHref
              legacyBehavior
            >
              <Button variant='primary'>Login</Button>
            </Link>
            <Link
              href='/register'
              passHref
              legacyBehavior
            >
              <Button variant='outline-primary'>Register</Button>
            </Link>
            <Link
              href='/dashboard'
              passHref
              legacyBehavior
            >
              <Button variant='outline-secondary'>Dashboard (Protected)</Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Card.Title>About NexoAuth</Card.Title>
          <Card.Text>
            NexoAuth is an authentication SDK for Next.js applications. It
            provides:
          </Card.Text>
          <ul>
            <li>
              Simple authentication client with login, logout, and registration
            </li>
            <li>React context provider and hook for auth state management</li>
            <li>Middleware for protecting routes</li>
            <li>Password reset and email verification flows</li>
          </ul>
        </Card.Body>
      </Card>
    </main>
  )
}
