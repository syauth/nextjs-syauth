import { auth } from './auth'

// Export the auth middleware
export default auth((req: { auth?: any; nextUrl?: any }) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Protect the /welcome route
  if (nextUrl.pathname.startsWith('/welcome') && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl))
  }

  // Redirect to /welcome if already logged in and trying to access login
  if (nextUrl.pathname.startsWith('/login') && isLoggedIn) {
    return Response.redirect(new URL('/welcome', nextUrl))
  }

  return null
})

// Configure middleware routes
export const config = {
  matcher: ['/welcome/:path*', '/login', '/api/auth/:path*'],
}
