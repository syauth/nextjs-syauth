'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useSyAuth } from 'nextjs-syauth'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Create a separate component that uses search params
function VerifyEmailForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [registered, setRegistered] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const { verifyEmail, requestVerificationCode } = useSyAuth()
  const searchParams = useSearchParams()

  // Get email and registered status from query parameters
  const emailParam = searchParams.get('email')
  const registeredParam = searchParams.get('registered')

  useEffect(() => {
    // Set email from query parameter
    if (emailParam) {
      setEmail(emailParam)
    }

    // Check if user just registered
    if (registeredParam === 'true') {
      setRegistered(true)
      setMessage({
        type: 'info',
        text: 'Thank you for registering! Please check your email for a verification code.',
      })
    }
  }, [emailParam, registeredParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)

    try {
      await verifyEmail(email, code)
      // The redirection will be handled by the verifyEmail function in the auth context
    } catch (error) {
      if (error instanceof Error) {
        setMessage({ type: 'danger', text: error.message })
      } else {
        setMessage({
          type: 'danger',
          text: 'Failed to verify email. Please check your code and try again.',
        })
      }
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setMessage({ type: '', text: '' })
    setResendLoading(true)

    try {
      await requestVerificationCode(email)
      setMessage({
        type: 'success',
        text: 'A new verification code has been sent to your email.',
      })
    } catch (error) {
      if (error instanceof Error) {
        setMessage({ type: 'danger', text: error.message })
      } else {
        setMessage({
          type: 'danger',
          text: 'Failed to resend verification code. Please try again later.',
        })
      }
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Card.Body>
      <h2 className='text-center mb-4'>Verify Your Email</h2>

      {message.text && <Alert variant={message.type}>{message.text}</Alert>}

      {registered && (
        <Alert variant='success'>
          <Alert.Heading>Registration Successful!</Alert.Heading>
          <p>
            Your account has been created. Before you can log in, please verify
            your email address by entering the verification code we sent to you.
          </p>
        </Alert>
      )}

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
          controlId='formCode'
        >
          <Form.Label>Verification Code</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter verification code'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </Form.Group>

        <div className='d-grid gap-2 mb-3'>
          <Button
            variant='primary'
            type='submit'
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </div>

        <div className='d-grid gap-2'>
          <Button
            variant='outline-secondary'
            onClick={handleResendCode}
            disabled={resendLoading || !email}
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Code'}
          </Button>
        </div>
      </Form>

      <hr />

      <div className='text-center'>
        <p>Already verified your email?</p>
        <Link href='/login'>
          <Button variant='outline-primary'>Go to Login</Button>
        </Link>
      </div>
    </Card.Body>
  )
}

// Loading fallback component
function VerifyEmailFormLoading() {
  return (
    <Card.Body>
      <h2 className='text-center mb-4'>Verify Your Email</h2>
      <p className='text-center'>Loading...</p>
    </Card.Body>
  )
}

// Main component that uses Suspense
export default function VerifyEmailPage() {
  return (
    <div className='d-flex justify-content-center'>
      <Card
        className='p-4 shadow'
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <Suspense fallback={<VerifyEmailFormLoading />}>
          <VerifyEmailForm />
        </Suspense>
      </Card>
    </div>
  )
}
