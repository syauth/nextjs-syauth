'use client'

import React, { useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useSyAuth } from 'nextjs-syauth'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const { requestPasswordReset } = useSyAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)

    try {
      await requestPasswordReset(email)
      setMessage({
        type: 'success',
        text: 'If an account with this email exists, a password reset code has been sent.',
      })
      setEmail('')
    } catch (error) {
      if (error instanceof Error) {
        setMessage({ type: 'danger', text: error.message })
      } else {
        setMessage({
          type: 'danger',
          text: 'Failed to send reset code. Please try again later.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='d-flex justify-content-center'>
      <Card
        className='p-4 shadow'
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <Card.Body>
          <h2 className='text-center mb-4'>Forgot Password</h2>

          {message.text && <Alert variant={message.type}>{message.text}</Alert>}

          <p className='mb-4'>
            Enter your email address below and we&apos;ll send you a code to
            reset your password.
          </p>

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

            <div className='d-grid gap-2'>
              <Button
                variant='primary'
                type='submit'
                disabled={loading}
              >
                {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
              </Button>
            </div>
          </Form>

          <hr />

          <div className='text-center'>
            <p>Remember your password?</p>
            <Link href='/login'>
              <Button variant='outline-primary'>Back to Login</Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
