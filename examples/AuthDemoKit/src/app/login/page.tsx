'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSyAuth } from 'nextjs-syauth'
import Link from 'next/link'

// Create a separate component that uses search params
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { login, isAuthenticated } = useSyAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get query parameters
  const returnTo = searchParams.get('return_to')
  const verified = searchParams.get('verified')
  const reset = searchParams.get('reset')
  const verifiedEmail = searchParams.get('email')

  useEffect(() => {
    // Set success message if user has been verified
    if (verified === 'true' && verifiedEmail) {
      setSuccessMessage(
        `Email ${verifiedEmail} has been verified. You can now log in.`
      )
    }

    // Set success message if password has been reset
    if (reset === 'true' && verifiedEmail) {
      setSuccessMessage(
        `Password has been reset. You can now log in with your new password.`
      )
      setEmail(verifiedEmail)
    }

    // Prefill email from query parameter
    if (verifiedEmail && !email) {
      setEmail(verifiedEmail)
    }

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push(returnTo || '/dashboard')
    }
  }, [verified, reset, verifiedEmail, isAuthenticated, router, returnTo, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      await login(email, password, rememberMe)
      // The redirection will be handled by the login function in the auth context
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(
          'Login failed. Please check your credentials and try again.'
        )
      }
      setLoading(false)
    }
  }

  return (
    <Card.Body>
      <h2 className='text-center mb-4'>Log In</h2>

      {successMessage && <Alert variant='success'>{successMessage}</Alert>}

      {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group
          className='mb-3'
          controlId='formEmail'
        >
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group
          className='mb-3'
          controlId='formPassword'
        >
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group
          className='mb-3'
          controlId='formRememberMe'
        >
          <Form.Check
            type='checkbox'
            label='Remember me'
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
        </Form.Group>

        <div className='d-grid gap-2'>
          <Button
            variant='primary'
            type='submit'
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </div>
      </Form>

      <div className='text-center mt-3'>
        <Link
          href='/forgot-password'
          className='text-decoration-none'
        >
          Forgot Password?
        </Link>
      </div>

      <hr />

      <div className='text-center'>
        <p>Don&apos;t have an account?</p>
        <Link href='/register'>
          <Button variant='outline-primary'>Sign Up</Button>
        </Link>
      </div>
    </Card.Body>
  )
}

// Loading fallback component
function LoginFormLoading() {
  return (
    <Card.Body>
      <h2 className='text-center mb-4'>Log In</h2>
      <p className='text-center'>Loading...</p>
    </Card.Body>
  )
}

// Main component that uses Suspense
export default function LoginPage() {
  return (
    <div className='d-flex justify-content-center'>
      <Card
        className='p-4 shadow'
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <Suspense fallback={<LoginFormLoading />}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  )
}
