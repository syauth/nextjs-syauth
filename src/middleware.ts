import { NextRequest, NextResponse } from 'next/server'

/**
 * Validates a redirect URL to prevent open redirect vulnerabilities
 * Only allows relative paths (starting with /) or same-origin URLs
 */
function isValidRedirectUrl(url: string, requestUrl: string): boolean {
  // Empty or undefined URLs are invalid
  if (!url || typeof url !== 'string') {
    return false
  }

  // Must start with / for relative paths
  if (!url.startsWith('/')) {
    return false
  }

  // Prevent protocol-relative URLs (//evil.com)
  if (url.startsWith('//')) {
    return false
  }

  // Prevent javascript: data: and other dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:']
  const lowercaseUrl = url.toLowerCase()
  if (dangerousProtocols.some(protocol => lowercaseUrl.includes(protocol))) {
    return false
  }

  // For additional safety, parse as URL and check it's relative
  try {
    const parsed = new URL(url, requestUrl)
    const request = new URL(requestUrl)
    // Only allow same origin
    return parsed.origin === request.origin
  } catch {
    // If URL parsing fails, only allow if it starts with / (relative path)
    return url.startsWith('/') && !url.startsWith('//')
  }
}

/**
 * Configuration options for the SyAuth middleware
 */
export interface MiddlewareOptions {
  /**
   * Routes that require authentication. User will be redirected to
   * the loginUrl if not authenticated.
   */
  protectedRoutes: string[]

  /**
   * Public authentication routes (login, register, etc.)
   * Defaults to: ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/auth/callback']
   */
  authRoutes?: string[]

  /**
   * URL to redirect to when authentication is required
   */
  loginUrl: string

  /**
   * URL to redirect to after successful login
   * Defaults to: '/dashboard'
   */
  defaultProtectedRoute?: string

  /**
   * Cookie name that indicates authentication status
   * Defaults to: 'auth_status'
   */
  authCookieName?: string
}

/**
 * Core middleware function that processes authentication
 * @internal
 */
function withAuthHandler(
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
    '/auth/callback', // OAuth callback route (public, no auth required)
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

  // Check if this is the OAuth callback route
  const isCallbackRoute = path === '/auth/callback' || path.startsWith('/auth/callback/')

  // Check for authentication via cookie
  const isAuthenticated = request.cookies.has(authCookieName)

  // Get return_to parameter if present
  const returnTo = request.nextUrl.searchParams.get('return_to')

  // If authenticated and on an auth page (but NOT callback), redirect to default protected route or return_to
  // Callback route is allowed even when authenticated to complete OAuth flow
  if (isAuthenticated && isAuthPath && !isCallbackRoute) {
    // Validate return_to URL to prevent open redirect vulnerability
    let redirectUrl = defaultProtectedRoute
    if (returnTo && isValidRedirectUrl(returnTo, request.url)) {
      redirectUrl = returnTo
    }
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

/**
 * Middleware helper for SyAuth authentication
 * 
 * This function is designed to work in Next.js Edge Runtime and does not include
 * any React dependencies. Use this in your middleware.ts file to protect routes.
 * 
 * Can be used in two ways:
 * 1. Convenient pattern (recommended): `withAuth(options)` - returns a middleware function
 * 2. Advanced pattern: `withAuth(request, options)` - directly processes the request
 * 
 * @example
 * ```typescript
 * // Convenient pattern (recommended)
 * import { withAuth } from '@syauth/nextjs/middleware'
 * 
 * export default withAuth({
 *   protectedRoutes: ['/dashboard', '/profile'],
 *   loginUrl: '/login',
 *   defaultProtectedRoute: '/dashboard'
 * })
 * ```
 * 
 * @example
 * ```typescript
 * // Advanced pattern
 * import { NextRequest } from 'next/server'
 * import { withAuth } from '@syauth/nextjs/middleware'
 * 
 * export default function middleware(request: NextRequest) {
 *   return withAuth(request, {
 *     protectedRoutes: ['/dashboard'],
 *     loginUrl: '/login'
 *   })
 * }
 * ```
 */
export function withAuth(
  options: MiddlewareOptions
): (request: NextRequest) => NextResponse
export function withAuth(
  request: NextRequest,
  options: MiddlewareOptions
): NextResponse
export function withAuth(
  requestOrOptions: NextRequest | MiddlewareOptions,
  options?: MiddlewareOptions
): NextResponse | ((request: NextRequest) => NextResponse) {
  // If only one argument is provided, return a middleware function
  if (!options) {
    const opts = requestOrOptions as MiddlewareOptions
    return (request: NextRequest) => withAuthHandler(request, opts)
  }
  
  // If two arguments are provided, process the request directly
  return withAuthHandler(requestOrOptions as NextRequest, options)
}
