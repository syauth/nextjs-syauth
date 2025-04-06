'use client'

import React, { useState } from 'react'
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap'
import { useNexoAuth } from 'nextjs-nexoauth'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { register } = useNexoAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      await register(formData)
      // The redirection will be handled by the register function in the auth context
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Registration failed. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <div className='d-flex justify-content-center'>
      <Card
        className='p-4 shadow'
        style={{ maxWidth: '600px', width: '100%' }}
      >
        <Card.Body>
          <h2 className='text-center mb-4'>Create an Account</h2>

          {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group
                  className='mb-3'
                  controlId='formFirstName'
                >
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type='text'
                    name='first_name'
                    placeholder='First Name'
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group
                  className='mb-3'
                  controlId='formLastName'
                >
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type='text'
                    name='last_name'
                    placeholder='Last Name'
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

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
              controlId='formPassword'
            >
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                name='password'
                placeholder='Password'
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Form.Text className='text-muted'>
                Password must be at least 8 characters long and include
                uppercase, lowercase, and numbers.
              </Form.Text>
            </Form.Group>

            <Form.Group
              className='mb-3'
              controlId='formConfirmPassword'
            >
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type='password'
                name='confirm_password'
                placeholder='Confirm Password'
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
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </div>
          </Form>

          <hr />

          <div className='text-center'>
            <p>Already have an account?</p>
            <Link href='/login'>
              <Button variant='outline-primary'>Log In</Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
