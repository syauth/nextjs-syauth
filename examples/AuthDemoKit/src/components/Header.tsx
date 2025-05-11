'use client'

import React from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSyAuth } from 'nextjs-syauth'

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, loading } = useSyAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <Navbar
      bg='dark'
      variant='dark'
      expand='lg'
      className='mb-4'
    >
      <Container>
        <Navbar.Brand
          as={Link}
          href='/'
        >
          SyAuth Test
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='me-auto'>
            <Nav.Link
              as={Link}
              href='/'
            >
              Home
            </Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link
                  as={Link}
                  href='/dashboard'
                >
                  Dashboard
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  href='/profile'
                >
                  Profile
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {loading ? (
              <Nav.Link disabled>Loading...</Nav.Link>
            ) : isAuthenticated ? (
              <>
                <Nav.Link disabled>{user?.email}</Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  href='/login'
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  href='/register'
                >
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
