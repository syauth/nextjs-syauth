# Next.js App with SyAuth SDK

**Example application demonstrating how to integrate SyAuth SDK into your Next.js app.**

This example shows how developers can use the `@syauth/nextjs` SDK to add authentication to their applications, similar to how Auth0's SDK works.

---

## Features

✅ **OAuth 2.0 Integration** - Full OAuth 2.0 Authorization Code Flow with PKCE
🔐 **Protected Routes** - Middleware-based route protection
👤 **User Profile** - Access and update user information
🎯 **Easy Setup** - Just wrap your app with `SyAuthProvider`
🚀 **Production Ready** - Built with Next.js 14 + TypeScript

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the values:

```bash
NEXT_PUBLIC_SYAUTH_API_URL=https://api.yourdomain.com/e/v1
NEXT_PUBLIC_SYAUTH_CLIENT_ID=your-oauth-client-id-here
NEXT_PUBLIC_SYAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

### 1. Wrap Your App with SyAuthProvider

```tsx
// src/app/layout.tsx
import { SyAuthProvider } from '@syauth/nextjs'

export default function RootLayout({ children }) {
  return (
    <SyAuthProvider
      config={{
        apiUrl: process.env.NEXT_PUBLIC_SYAUTH_API_URL!,
        oauthClientId: process.env.NEXT_PUBLIC_SYAUTH_CLIENT_ID!,
        redirectUri: process.env.NEXT_PUBLIC_SYAUTH_REDIRECT_URI!,
      }}
      redirectAfterLogin="/dashboard"
    >
      {children}
    </SyAuthProvider>
  )
}
```

### 2. Use the SDK Hooks

```tsx
// In any component
import { useSyAuth } from '@syauth/nextjs'

export default function MyComponent() {
  const { user, isAuthenticated, loginWithRedirect, logout } = useSyAuth()

  if (!isAuthenticated) {
    return <button onClick={() => loginWithRedirect()}>Sign In</button>
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={() => logout()}>Sign Out</button>
    </div>
  )
}
```

### 3. Handle OAuth Callback

```tsx
// src/app/auth/callback/page.tsx
'use client'

import { useOAuthCallback } from '@syauth/nextjs'

export default function CallbackPage() {
  const { loading, error } = useOAuthCallback()

  if (loading) return <div>Processing...</div>
  if (error) return <div>Error: {error}</div>
  return <div>Success! Redirecting...</div>
}
```

### 4. Protect Routes with Middleware

```tsx
// src/middleware.ts
import { withAuth } from '@syauth/nextjs'

export default withAuth({
  protectedRoutes: ['/dashboard', '/profile'],
  defaultProtectedRoute: '/dashboard',
  loginUrl: '/',
})
```

---

## Authentication Flow

1. **User clicks "Sign In"** → Calls `loginWithRedirect()`
2. **Redirect to SyAuth** → User goes to your deployed login page (e.g., `login.yourdomain.com`)
3. **User authenticates** → Enters credentials on your branded login page
4. **Redirect back** → Returns to `/auth/callback` with authorization code
5. **Token exchange** → SDK exchanges code for access token using PKCE
6. **User authenticated** → User object is available via `useSyAuth()` hook

---

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   └── callback/         # OAuth callback handler
│   ├── dashboard/            # Protected dashboard page
│   ├── profile/              # Protected profile page
│   ├── layout.tsx            # Root layout with SyAuthProvider
│   ├── page.tsx              # Home page (public)
│   └── globals.css
├── lib/
│   └── syauth-config.ts      # SyAuth SDK configuration
└── middleware.ts             # Route protection middleware
```

---

## SDK Hooks

### `useSyAuth()`

Main hook for authentication:

```tsx
const {
  user,                  // Current user object
  isAuthenticated,       // Boolean auth status
  loading,               // Loading state
  error,                 // Error message
  authClient,            // Direct SDK client access
  loginWithRedirect,     // Initiate OAuth login
  logout,                // Sign out user
  updateProfile,         // Update user profile
} = useSyAuth()
```

### `useOAuthCallback()`

Hook for handling OAuth callback:

```tsx
const {
  loading,   // Processing callback
  error,     // Error message
  success,   // Callback successful
} = useOAuthCallback()
```

---

## Middleware Options

```tsx
withAuth({
  protectedRoutes: ['/dashboard', '/profile'],  // Routes requiring auth
  defaultProtectedRoute: '/dashboard',          // Default redirect after login
  loginUrl: '/',                                // Where to redirect unauthenticated users
})
```

---

## Comparison with Auth0

| Feature | Auth0 SDK | SyAuth SDK |
|---------|-----------|------------|
| OAuth 2.0 with PKCE | ✅ | ✅ |
| React Hooks | ✅ | ✅ |
| Route Protection | ✅ | ✅ |
| User Profile | ✅ | ✅ |
| Custom Branding | ✅ | ✅ |
| Self-Hosted | ❌ | ✅ |
| Open Source | ❌ | ✅ |

---

## Next Steps

- Customize the login page using the `nextjs-login-template`
- Deploy your login page to `login.yourdomain.com`
- Configure OAuth client in SyAuth Dashboard
- Add social login providers
- Implement additional features (password reset, email verification, etc.)

---

## Documentation

- [SyAuth SDK Documentation](../../README.md)
- [Login Template](../nextjs-login-template/README.md)
- [SyAuth Dashboard](https://dashboard.yourdomain.com)

---

## License

MIT

**Built with ❤️ by Nexorix**
