'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useSyAuth } from 'nextjs-syauth'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Create a separate component that uses search params
function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    new_password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { confirmPasswordReset } = useSyAuth()
  const searchParams = useSearchParams()

  // Get email from query parameter
  const emailParam = searchParams.get('email')

  useEffect(() => {
    // Prefill email from query parameter
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }))
    }
  }, [emailParam])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    // Check if passwords match
    if (formData.new_password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      await confirmPasswordReset({
        email: formData.email,
        code: formData.code,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      })
      // The redirection will be handled by the confirmPasswordReset function in the auth context
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(
          'Failed to reset password. Please check your code and try again.'
        )
      }
      setLoading(false)
    }
  }

  return (
    <Card.Body>
      <h2 className='text-center mb-4'>Reset Password</h2>

      {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}

      <p className='mb-4'>
        Enter the code that was sent to your email along with your new password.
      </p>

      <Form onSubmit={handleSubmit}>
        <Form.Group
          className='mb-3'
          controlId='formEmail'
        >
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type='email'
            name='email'
            placeholder='Enter email'
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group
          className='mb-3'
          controlId='formCode'
        >
          <Form.Label>Reset Code</Form.Label>
          <Form.Control
            type='text'
            name='code'
            placeholder='Enter reset code'
            value={formData.code}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group
          className='mb-3'
          controlId='formNewPassword'
        >
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type='password'
            name='new_password'
            placeholder='New password'
            value={formData.new_password}
            onChange={handleChange}
            required
          />
          <Form.Text className='text-muted'>
            Password must be at least 8 characters long and include uppercase,
            lowercase, and numbers.
          </Form.Text>
        </Form.Group>

        <Form.Group
          className='mb-3'
          controlId='formConfirmPassword'
        >
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type='password'
            name='confirm_password'
            placeholder='Confirm new password'
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <div className='d-grid gap-2'>
          <Button
            variant='primary'
            type='submit'
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </div>
      </Form>

      <hr />

      <div className='text-center'>
        <p>Didn&apos;t receive a code?</p>
        <Link href='/forgot-password'>
          <Button variant='outline-primary'>Request New Code</Button>
        </Link>
      </div>
    </Card.Body>
  )
}

// Loading fallback component
function ResetPasswordFormLoading() {
  return (
    <Card.Body>
      <h2 className='text-center mb-4'>Reset Password</h2>
      <p className='text-center'>Loading...</p>
    </Card.Body>
  )
}

// Main component that uses Suspense
export default function ResetPasswordPage() {
  return (
    <div className='d-flex justify-content-center'>
      <Card
        className='p-4 shadow'
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <Suspense fallback={<ResetPasswordFormLoading />}>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </div>
  )
}
