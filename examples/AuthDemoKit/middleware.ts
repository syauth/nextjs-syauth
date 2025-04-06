import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the path
  const path = request.nextUrl.pathname

  // Define protected routes and auth routes
  const protectedRoutes = ['/dashboard', '/profile']
  const authRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ]
  const loginUrl = '/login'
  const defaultProtectedRoute = '/dashboard'
  const authCookieName = 'auth_status'

  // Check if the path is protected
  const isProtectedPath = protectedRoutes.some(
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
    const loginUrl = new URL('/login', request.url)
    // Add current path as return_to parameter for post-login redirect
    loginUrl.searchParams.set('return_to', path)
    return NextResponse.redirect(loginUrl)
  }

  // Otherwise continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
