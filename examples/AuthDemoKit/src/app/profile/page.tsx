'use client'

import React, { useState } from 'react'
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap'
import { useNexoAuth } from 'nextjs-nexoauth'

export default function ProfilePage() {
  const { user, loading, updateProfile } = useNexoAuth()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    job_title: '',
    phone_number: '',
    country: '',
  })
  const [formLoading, setFormLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    confirm_password: '',
  })
  const [passwordFormVisible, setPasswordFormVisible] = useState(false)

  // Populate form when user data is loaded
  React.useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        company: user.company || '',
        job_title: user.job_title || '',
        phone_number: user.phone_number || '',
        country: user.country || '',
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData({ ...passwordData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Use the updateProfile method from NexoAuth
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        company: formData.company,
        job_title: formData.job_title,
        phone_number: formData.phone_number,
        country: formData.country,
      })

      setMessage({
        type: 'success',
        text: 'Profile updated successfully.',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Failed to update profile.',
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (passwordData.password !== passwordData.confirm_password) {
      setMessage({
        type: 'error',
        text: 'New password and confirmation do not match.',
      })
      return
    }

    setFormLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Use the updateProfile method to update password
      await updateProfile({
        current_password: passwordData.current_password,
        password: passwordData.password,
      })

      setMessage({
        type: 'success',
        text: 'Password updated successfully.',
      })

      // Reset password form
      setPasswordData({
        current_password: '',
        password: '',
        confirm_password: '',
      })
      setPasswordFormVisible(false)
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Failed to update password.',
      })
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return <Alert variant='info'>Loading user profile...</Alert>
  }

  return (
    <div>
      <h1 className='mb-4'>Profile</h1>

      {message.text && (
        <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
          {message.text}
        </Alert>
      )}

      <Row>
        <Col
          md={8}
          className='mb-4'
        >
          <Card className='mb-4'>
            <Card.Header>Edit Profile</Card.Header>
            <Card.Body>
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
                        value={formData.first_name}
                        onChange={handleChange}
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
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group
                      className='mb-3'
                      controlId='formCompany'
                    >
                      <Form.Label>Company</Form.Label>
                      <Form.Control
                        type='text'
                        name='company'
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group
                      className='mb-3'
                      controlId='formJobTitle'
                    >
                      <Form.Label>Job Title</Form.Label>
                      <Form.Control
                        type='text'
                        name='job_title'
                        value={formData.job_title}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group
                      className='mb-3'
                      controlId='formPhoneNumber'
                    >
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type='tel'
                        name='phone_number'
                        value={formData.phone_number}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group
                      className='mb-3'
                      controlId='formCountry'
                    >
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type='text'
                        name='country'
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className='d-grid gap-2'>
                  <Button
                    variant='primary'
                    type='submit'
                    disabled={formLoading}
                  >
                    {formLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Password Change Form */}
          {passwordFormVisible && (
            <Card className='mb-4'>
              <Card.Header>Change Password</Card.Header>
              <Card.Body>
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group
                    className='mb-3'
                    controlId='formCurrentPassword'
                  >
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type='password'
                      name='current_password'
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
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
                      name='password'
                      value={passwordData.password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group
                    className='mb-3'
                    controlId='formConfirmPassword'
                  >
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type='password'
                      name='confirm_password'
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <div className='d-flex gap-2'>
                    <Button
                      variant='primary'
                      type='submit'
                      disabled={formLoading}
                    >
                      {formLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button
                      variant='secondary'
                      type='button'
                      onClick={() => setPasswordFormVisible(false)}
                      disabled={formLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card className='mb-4'>
            <Card.Header>Account Info</Card.Header>
            <Card.Body>
              <dl>
                <dt>Email</dt>
                <dd>{user?.email}</dd>

                <dt>Verified</dt>
                <dd>{user?.email_verified ? 'Yes' : 'No'}</dd>

                <dt>User Type</dt>
                <dd>{user?.user_type}</dd>
              </dl>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>Security</Card.Header>
            <Card.Body>
              <p>Manage your account security settings.</p>
              <div className='d-grid gap-2'>
                <Button
                  variant='outline-primary'
                  size='sm'
                  onClick={() => setPasswordFormVisible(!passwordFormVisible)}
                >
                  {passwordFormVisible
                    ? 'Hide Password Form'
                    : 'Change Password'}
                </Button>
                <Button
                  variant='outline-danger'
                  size='sm'
                  disabled
                >
                  Delete Account
                </Button>
              </div>
              <div className='mt-2'>
                <small className='text-muted'>
                  Delete account functionality is disabled in this demo.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
