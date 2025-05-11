import { NextRequest } from 'next/server'
import { withAuth } from 'nextjs-syauth'

export function middleware(request: NextRequest) {
  return withAuth(request, {
    protectedRoutes: ['/dashboard', '/profile'],
    loginUrl: '/login',
    defaultProtectedRoute: '/dashboard',
  })
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
