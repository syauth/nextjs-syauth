# OAuth 2.0 Integration Guide

This guide explains how to integrate the nextjs-syauth SDK using the OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange).

## Table of Contents

- [Why OAuth 2.0?](#why-oauth-20)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [OAuth Flow Explained](#oauth-flow-explained)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)

---

## Why OAuth 2.0?

The nextjs-syauth SDK v0.2.0+ uses OAuth 2.0 Authorization Code Flow with PKCE, which provides:

✅ **No CORS Issues** - Authentication happens via browser redirects, not cross-origin API calls
✅ **Enhanced Security** - PKCE protects against authorization code interception attacks
✅ **OAuth 2.1 Compliant** - Follows latest OAuth best practices
✅ **Scalable** - Works for unlimited client domains without CORS configuration
✅ **Industry Standard** - Same flow used by Auth0, Okta, Google, Microsoft

**Password grant (v0.1.x)** is deprecated in OAuth 2.1 and causes CORS errors when called from third-party domains.

---

## Prerequisites

1. **OAuth Client** registered in s0011backend developer portal
   - Client ID (UUID)
   - Redirect URIs configured (important!)

2. **Next.js Application** (App Router)
   - Next.js 13+ with App Router
   - Running with HTTPS in development (required for OAuth)

3. **Environment Variables**
   - API URL
   - API Key
   - OAuth Client ID
   - Redirect URI

---

## Quick Start

### 1. Install the SDK

```bash
npm install nextjs-syauth@latest
```

### 2. Configure Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.com/e/v1
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_OAUTH_CLIENT_ID=your-client-id
NEXT_PUBLIC_REDIRECT_URI=https://your-app.com/auth/callback
```

### 3. Initialize SyAuth Client

`src/syauth.config.ts`:

```typescript
import { SyAuth } from 'nextjs-syauth'

const syAuthClient = new SyAuth({
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY!,
  oauthClientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!,
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
  scopes: 'openid profile email', // Optional
})

export default syAuthClient
```

### 4. Wrap Your App with SyAuthProvider

`src/app/layout.tsx`:

```typescript
import { SyAuthProvider } from 'nextjs-syauth'
import syAuthClient from '@/syauth.config'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SyAuthProvider authClient={syAuthClient}>
          {children}
        </SyAuthProvider>
      </body>
    </html>
  )
}
```

### 5. Create Callback Page

`src/app/auth/callback/page.tsx`:

```typescript
'use client'

import { useOAuthCallback } from 'nextjs-syauth'

export default function CallbackPage() {
  const { loading, error } = useOAuthCallback()

  if (loading) return <div>Completing sign in...</div>
  if (error) return <div>Error: {error}</div>

  return <div>Success! Redirecting...</div>
}
```

### 6. Add Login Button

`src/app/login/page.tsx`:

```typescript
'use client'

import { useSyAuth } from 'nextjs-syauth'

export default function LoginPage() {
  const { loginWithRedirect } = useSyAuth()

  return (
    <button onClick={() => loginWithRedirect()}>
      Sign In with OAuth 2.0
    </button>
  )
}
```

### 7. Update Backend OAuth Client

Run this SQL on your s0011backend database:

```sql
UPDATE s0011_oauth_client
SET redirect_uris = E'https://your-app.com/auth/callback'
WHERE client_id = 'your-client-id';
```

**Important**: `redirect_uris` must include your callback URL. Multiple URIs are separated by newlines.

---

## Detailed Setup

### Backend Configuration

#### 1. Register OAuth Client

In the s0011backend developer portal:
- Navigate to OAuth Clients
- Create new client
- Note the Client ID (UUID)
- Configure redirect URIs

#### 2. Redirect URI Format

The redirect URI must match exactly (including protocol, domain, port, and path):

```
✅ https://app.example.com/auth/callback
✅ https://localhost:3000/auth/callback
❌ http://app.example.com/auth/callback  (wrong protocol)
❌ https://app.example.com/callback      (wrong path)
```

**Development**: Use your local HTTPS URL
**Production**: Use your production domain

### Frontend Configuration

#### 1. Next.js HTTPS (Development)

OAuth requires HTTPS. Configure Next.js to run with HTTPS:

`next.config.js`:

```javascript
module.exports = {
  // ... other config
  devServer: {
    https: true,
  },
}
```

Or run with:

```bash
npm run dev -- --experimental-https
```

#### 2. Middleware Setup

Protect routes using the withAuth middleware:

`src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from 'nextjs-syauth'

export function middleware(request: NextRequest) {
  return withAuth(request, {
    protectedRoutes: ['/dashboard', '/profile', '/settings'],
    loginUrl: '/login',
    authRoutes: ['/login', '/register', '/auth/callback'], // callback is public
  })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

**Note**: The `/auth/callback` route is automatically exempted from authentication checks.

---

## OAuth Flow Explained

### Step-by-Step Flow

```
1. User clicks "Sign In"
   ↓
2. App calls loginWithRedirect()
   ↓
3. SDK generates PKCE parameters:
   - code_verifier (random string)
   - code_challenge (SHA-256 hash of verifier)
   - state (CSRF protection token)
   ↓
4. SDK stores verifier & state in sessionStorage
   ↓
5. SDK redirects browser to:
   https://backend.com/oauth/authorize?
     client_id=abc123&
     redirect_uri=https://app.com/auth/callback&
     response_type=code&
     scope=openid profile email&
     state=xyz789&
     code_challenge=...&
     code_challenge_method=S256
   ↓
6. User sees login form on backend domain (no CORS!)
   ↓
7. User enters credentials (same-origin POST, no CORS!)
   ↓
8. Backend validates credentials
   ↓
9. Backend redirects to:
   https://app.com/auth/callback?code=abc123&state=xyz789
   ↓
10. Callback page calls useOAuthCallback()
   ↓
11. Hook retrieves code_verifier from sessionStorage
   ↓
12. Hook validates state parameter (CSRF protection)
   ↓
13. Hook calls /oauth/token/ with:
    - code
    - code_verifier
    - client_id
    - redirect_uri
    ↓
14. Backend validates PKCE & issues tokens
    ↓
15. SDK stores access_token & fetches user profile
    ↓
16. SDK redirects to dashboard
```

### Why No CORS Errors?

1. **Login form** is served on the backend domain (same-origin)
2. **Form submission** is same-origin POST (no CORS preflight)
3. **Token exchange** calls `/oauth/token/` which has wildcard CORS `Access-Control-Allow-Origin: *`
4. **No credentials** in cross-origin requests to login form

---

## Configuration Reference

### SyAuthConfig

```typescript
interface SyAuthConfig {
  apiUrl: string              // Backend API base URL (required)
  apiKey: string              // API key for registration (required)
  oauthClientId: string       // OAuth client ID (required)
  redirectUri?: string        // OAuth callback URL (required for OAuth flow)
  scopes?: string             // OAuth scopes (default: "openid profile email")
  onLoginSuccess?: (user) => void
  onLogout?: () => void
}
```

### SyAuthProvider Props

```typescript
interface AuthProviderProps {
  authClient: SyAuth
  redirectAfterLogin?: string      // Default: '/dashboard'
  unauthorizedRedirect?: string    // Default: '/login'
}
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com/e/v1` |
| `NEXT_PUBLIC_API_KEY` | API key | `krtYvEtn15Az...` |
| `NEXT_PUBLIC_OAUTH_CLIENT_ID` | OAuth client UUID | `0a14905d-1527-4f72...` |
| `NEXT_PUBLIC_REDIRECT_URI` | Callback URL | `https://app.com/auth/callback` |

---

## Troubleshooting

### "redirectUri is required" Error

**Cause**: `redirectUri` not provided in SyAuthConfig

**Solution**:
```typescript
const syAuthClient = new SyAuth({
  // ...
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
})
```

### "Invalid redirect_uri" Error

**Cause**: Redirect URI not registered in OAuth client

**Solution**: Update s0011_oauth_client table:

```sql
UPDATE s0011_oauth_client
SET redirect_uris = E'https://your-app.com/auth/callback\nhttps://localhost:3000/auth/callback'
WHERE client_id = 'your-client-id';
```

### "Invalid state parameter" Error

**Cause**:
- Stale session storage
- State parameter mismatch
- CSRF attack attempt

**Solution**:
- Clear browser sessionStorage
- Try login flow again
- Check browser console for errors

### CORS Errors

**If you still get CORS errors**, you're likely using the deprecated password grant:

```typescript
// ❌ Deprecated (causes CORS)
await login(email, password)

// ✅ Use OAuth 2.0 instead
await loginWithRedirect()
```

### Callback Page Not Working

**Checklist**:
1. ✓ Callback route exists: `src/app/auth/callback/page.tsx`
2. ✓ Using `useOAuthCallback()` hook
3. ✓ Middleware exempts `/auth/callback`
4. ✓ `redirectUri` in config matches callback URL exactly
5. ✓ Backend has callback URL in `redirect_uris`

### Token Exchange Failed

**Common causes**:
- Code already used (codes are single-use)
- Code expired (10 minutes TTL)
- PKCE verification failed (code_verifier doesn't match challenge)
- Invalid client_id
- Redirect URI mismatch

**Debug**:
- Check browser console for error details
- Check backend logs for token endpoint errors
- Verify PKCE parameters in sessionStorage

---

## Migration from v0.1.x

See [Migration Guide](./migration-v0.2.md) for step-by-step instructions to migrate from password grant to OAuth 2.0.

---

## Additional Resources

- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)

---

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review the example app: `examples/AuthDemoKit`
- Contact support: support@yourdomain.com
