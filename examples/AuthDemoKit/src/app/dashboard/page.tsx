'use client'

import React from 'react'
import { Card, Alert, Row, Col } from 'react-bootstrap'
import { useSyAuth } from 'nextjs-syauth'

export default function DashboardPage() {
  const { user, loading } = useSyAuth()

  if (loading) {
    return <Alert variant='info'>Loading...</Alert>
  }

  return (
    <div>
      <h1 className='mb-4'>Dashboard</h1>

      <Alert variant='success'>
        <Alert.Heading>Welcome to your dashboard!</Alert.Heading>
        <p>
          This is a protected page that only authenticated users can access. If
          you can see this, the SyAuth authentication is working correctly.
        </p>
      </Alert>

      <Row>
        <Col
          md={6}
          className='mb-4'
        >
          <Card>
            <Card.Header>User Profile</Card.Header>
            <Card.Body>
              <dl>
                <dt>User ID</dt>
                <dd>{user?.id}</dd>

                <dt>Name</dt>
                <dd>
                  {user?.first_name} {user?.last_name}
                </dd>

                <dt>Email</dt>
                <dd>{user?.email}</dd>

                <dt>Email Verified</dt>
                <dd>{user?.email_verified ? 'Yes' : 'No'}</dd>

                <dt>User Type</dt>
                <dd>{user?.user_type}</dd>
              </dl>
            </Card.Body>
          </Card>
        </Col>

        <Col
          md={6}
          className='mb-4'
        >
          <Card>
            <Card.Header>Authentication Info</Card.Header>
            <Card.Body>
              <p>
                The authentication is managed by the SyAuth SDK which handles:
              </p>
              <ul>
                <li>Authentication state management</li>
                <li>Token storage and refresh</li>
                <li>Protected route middleware</li>
                <li>Automatic redirects for unauthenticated users</li>
              </ul>
              <p>
                <strong>SDK Status:</strong>{' '}
                <span className='text-success'>Working correctly</span>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
