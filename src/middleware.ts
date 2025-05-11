import { NextRequest, NextResponse } from 'next/server'

export interface MiddlewareOptions {
  /**
   * Routes that require authentication. User will be redirected to
   * the loginUrl if not authenticated.
   */
  protectedRoutes: string[]

  /**
   * Public authentication routes (login, register, etc.)
   */
  authRoutes?: string[]

  /**
   * URL to redirect to when authentication is required
   */
  loginUrl: string

  /**
   * URL to redirect to after successful login
   */
  defaultProtectedRoute?: string

  /**
   * Cookie name that indicates authentication status
   */
  authCookieName?: string
}

/**
 * Middleware helper for SyAuth
 */
export function withAuth(
  request: NextRequest,
  options: MiddlewareOptions
): NextResponse {
  // Get the path
  const path = request.nextUrl.pathname

  // Get options with defaults
  const authCookieName = options.authCookieName || 'auth_status'
  const defaultProtectedRoute = options.defaultProtectedRoute || '/dashboard'
  const authRoutes = options.authRoutes || [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ]

  // Check if the path is protected
  const isProtectedPath = options.protectedRoutes.some(
    (protectedPath) =>
      path === protectedPath || path.startsWith(`${protectedPath}/`)
  )

  // Check if the path is an auth path
  const isAuthPath = authRoutes.some(
    (authPath) => path === authPath || path.startsWith(`${authPath}/`)
  )

  // Check for authentication via cookie
  const isAuthenticated = request.cookies.has(authCookieName)

  // Get return_to parameter if present
  const returnTo = request.nextUrl.searchParams.get('return_to')

  // If authenticated and on an auth page, redirect to default protected route or return_to
  if (isAuthenticated && isAuthPath) {
    const redirectUrl = returnTo || defaultProtectedRoute
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // If the path is protected and the user is not authenticated, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL(options.loginUrl, request.url)
    // Add current path as return_to parameter for post-login redirect
    loginUrl.searchParams.set('return_to', path)
    return NextResponse.redirect(loginUrl)
  }

  // Handle redirect loops - if the redirect loop counter is too high, just proceed
  const redirectCount = parseInt(
    request.cookies.get('redirect_count')?.value || '0'
  )
  if (redirectCount > 5) {
    const response = NextResponse.next()
    response.cookies.set('redirect_count', '0')
    return response
  }

  // If a redirect is happening, increment the counter
  if (isProtectedPath || isAuthPath) {
    const response = NextResponse.next()
    response.cookies.set('redirect_count', (redirectCount + 1).toString())
    return response
  }

  // Otherwise continue with the request
  return NextResponse.next()
}
