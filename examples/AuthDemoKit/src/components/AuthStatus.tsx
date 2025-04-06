'use client'

import React from 'react'
import { Alert } from 'react-bootstrap'
import { useNexoAuth } from 'nextjs-nexoauth'

const AuthStatus: React.FC = () => {
  const { isAuthenticated, user, loading, error } = useNexoAuth()

  if (loading) {
    return <Alert variant='info'>Checking authentication status...</Alert>
  }

  if (error) {
    return <Alert variant='danger'>Error: {error}</Alert>
  }

  if (isAuthenticated) {
    return (
      <Alert variant='success'>
        Logged in as {user?.first_name} {user?.last_name} ({user?.email})
      </Alert>
    )
  }

  return <Alert variant='warning'>You are not logged in</Alert>
}

export default AuthStatus
