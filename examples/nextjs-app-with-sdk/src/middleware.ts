import { withAuth } from '@syauth/nextjs/middleware'

/**
 * Middleware for route protection using SyAuth SDK
 *
 * This middleware:
 * - Protects routes that require authentication
 * - Redirects unauthenticated users to login
 * - Allows public routes without authentication
 */
export default withAuth({
  // Routes that require authentication
  protectedRoutes: ['/dashboard', '/profile', '/settings'],

  // Where to redirect after login
  defaultProtectedRoute: '/dashboard',

  // Login page URL
  loginUrl: '/',
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
