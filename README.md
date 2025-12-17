# @syauth/nextjs

**OAuth 2.0 Authentication SDK for Next.js applications.**

Build secure authentication into your Next.js apps with full control over your infrastructure and branding.

[![npm version](https://badge.fury.io/js/%40syauth%2Fnextjs.svg)](https://www.npmjs.com/package/@syauth/nextjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

✨ **OAuth 2.0 with PKCE** - Industry-standard authorization code flow
🔐 **Secure by Default** - PKCE protection, OAuth 2.1 best practices
⚡ **3-Step Integration** - Provider, hooks, callback - done!
🎯 **TypeScript Ready** - Full type safety included
🎨 **White-Label** - Deploy your own branded login page
🚀 **Production Ready** - Next.js 14+ and React 18+

---

## Installation

```bash
npm install @syauth/nextjs
```

---

## Quick Start

### 1. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SYAUTH_API_URL=https://api.yourdomain.com/e/v1
NEXT_PUBLIC_SYAUTH_CLIENT_ID=your-client-id
NEXT_PUBLIC_SYAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_SYAUTH_API_KEY=your-api-key  # Optional - required only for user registration
```

### 2. Wrap Your App

```tsx
// src/app/layout.tsx
import { SyAuthProvider } from '@syauth/nextjs';

export default function RootLayout({ children }) {
  return (
    <SyAuthProvider
      config={{
        apiUrl: process.env.NEXT_PUBLIC_SYAUTH_API_URL!,
        oauthClientId: process.env.NEXT_PUBLIC_SYAUTH_CLIENT_ID!,
        redirectUri: process.env.NEXT_PUBLIC_SYAUTH_REDIRECT_URI!,
        apiKey: process.env.NEXT_PUBLIC_SYAUTH_API_KEY, // Optional - for registration
      }}
      redirectAfterLogin="/dashboard"
    >
      {children}
    </SyAuthProvider>
  );
}
```

### 3. Add Login

```tsx
// src/app/page.tsx
'use client';
import { useSyAuth } from '@syauth/nextjs';

export default function HomePage() {
  const { loginWithRedirect } = useSyAuth();
  return <button onClick={() => loginWithRedirect()}>Sign In</button>;
}
```

### 4. Handle Callback

```tsx
// src/app/auth/callback/page.tsx
'use client';
import { useOAuthCallback } from '@syauth/nextjs';

export default function CallbackPage() {
  const { loading, error } = useOAuthCallback();
  if (loading) return <div>Authenticating...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>Success!</div>;
}
```

### 5. Use Auth State

```tsx
'use client';
import { useSyAuth } from '@syauth/nextjs';

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useSyAuth();

  if (!isAuthenticated) return <p>Please sign in</p>;

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={() => logout()}>Sign Out</button>
    </div>
  );
}
```

**Done!** 🎉

---

## Package Exports

The package provides three main export paths for different use cases:

### Client Exports (`@syauth/nextjs`)

For React components and client-side code:

```tsx
import { 
  SyAuthProvider, 
  useSyAuth, 
  useOAuthCallback,
  SyAuth 
} from '@syauth/nextjs';
```

### Middleware Exports (`@syauth/nextjs/middleware`)

For Next.js Edge Runtime middleware (no React dependencies):

```tsx
import { withAuth } from '@syauth/nextjs/middleware';
```

### Server Exports (`@syauth/nextjs/server`)

For server-side utilities (future use):

```tsx
import { /* server utilities */ } from '@syauth/nextjs/server';
```

---

## API Reference

### `useSyAuth()`

```tsx
const {
  user,                // Current user object
  isAuthenticated,     // Boolean auth status
  loading,             // Loading state
  loginWithRedirect,   // Start OAuth flow
  logout,              // Sign out
  register,            // Register new user
  updateProfile,       // Update user info
  verifyEmail,         // Verify email
  forgotPassword,      // Request password reset
  resetPassword,       // Reset password
} = useSyAuth();
```

**Example - Registration:**

```tsx
const { register } = useSyAuth();

const handleRegister = async () => {
  await register({
    email: 'user@example.com',
    password: 'securePassword123',
    first_name: 'John',
    last_name: 'Doe',
  });
  // User created! Redirect to email verification
};
```

### `useOAuthCallback()`

```tsx
const {
  loading, // Processing callback
  error, // Error message
  success, // Success status
} = useOAuthCallback();
```

### `withAuth()` - Route Protection Middleware

The `withAuth` helper supports two usage patterns:

#### Convenient Pattern (Recommended)

```tsx
// src/middleware.ts
import { withAuth } from '@syauth/nextjs/middleware';

export default withAuth({
  protectedRoutes: ['/dashboard', '/profile'],
  loginUrl: '/',
  defaultProtectedRoute: '/dashboard',
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

#### Advanced Pattern

For cases where you need to add custom logic:

```tsx
// src/middleware.ts
import { NextRequest } from 'next/server';
import { withAuth } from '@syauth/nextjs/middleware';

export default function middleware(request: NextRequest) {
  // Add custom logic here if needed
  return withAuth(request, {
    protectedRoutes: ['/dashboard', '/profile'],
    loginUrl: '/',
    defaultProtectedRoute: '/dashboard',
  });
}
```

**Middleware Options:**

| Option                  | Type     | Required | Description                                    |
| ----------------------- | -------- | -------- | ---------------------------------------------- |
| `protectedRoutes`       | string[] | ✅       | Routes that require authentication             |
| `loginUrl`              | string   | ✅       | URL to redirect unauthenticated users          |
| `defaultProtectedRoute` | string   | ❌       | Default redirect after login (default: `/dashboard`) |
| `authRoutes`            | string[] | ❌       | Public auth routes (default: login, register, etc.) |
| `authCookieName`        | string   | ❌       | Cookie name for auth status (default: `auth_status`) |

**Note:** Middleware runs in Edge Runtime and cannot use React hooks. Always import from `@syauth/nextjs/middleware` for middleware usage.

---

## Examples

### Full Example App

📁 [examples/nextjs-app-with-sdk](./examples/nextjs-app-with-sdk/)

Complete working example with:
- ✅ OAuth 2.0 login
- ✅ User registration
- ✅ Protected dashboard
- ✅ Profile management
- ✅ Route protection

### Universal Login Template

📁 [examples/nextjs-login-template](./examples/nextjs-login-template/)

White-label login & registration pages you can deploy to `login.yourdomain.com`:
- ✅ Branded login UI
- ✅ User registration
- ✅ Social login support
- ✅ Dynamic theming

---

## Configuration

### SyAuthProvider Props

| Prop                   | Type   | Required | Description                                    |
| ---------------------- | ------ | -------- | ---------------------------------------------- |
| `config.apiUrl`        | string | ✅       | Your SyAuth backend API URL                    |
| `config.oauthClientId` | string | ✅       | OAuth client ID                                |
| `config.redirectUri`   | string | ✅       | OAuth callback URL                             |
| `config.apiKey`        | string | ❌       | API key (required only for user registration)  |
| `config.scopes`        | string | ❌       | OAuth scopes (default: "openid profile email") |
| `redirectAfterLogin`   | string | ❌       | Redirect destination after login               |

### Environment Variables

```bash
NEXT_PUBLIC_SYAUTH_API_URL=https://api.yourdomain.com/e/v1
NEXT_PUBLIC_SYAUTH_CLIENT_ID=your-client-id
NEXT_PUBLIC_SYAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_SYAUTH_API_KEY=your-api-key  # Optional - required for user registration
```

**Note:**
- Redirect URI must match exactly in your OAuth client configuration
- API Key is only required if you want to support user registration via the SDK

---

## TypeScript

Full TypeScript support included:

```tsx
// Client types
import type {
  AuthUser,
  SyAuthConfig,
  RegisterData,
  OAuthCallbackParams,
  UseOAuthCallbackResult,
} from '@syauth/nextjs';

// Middleware types
import type { MiddlewareOptions } from '@syauth/nextjs/middleware';
```

---

## How It Works

```
User clicks "Sign In"
  ↓
loginWithRedirect() generates PKCE params
  ↓
Redirect to your login page
  ↓
User authenticates
  ↓
Redirect to /auth/callback with code
  ↓
useOAuthCallback() exchanges code for token
  ↓
User authenticated ✅
```

**Security:** Uses OAuth 2.0 Authorization Code Flow with PKCE (RFC 7636) - industry-standard authentication protocol.

**Token Management:**
- ✅ Automatic token refresh before expiry (5-minute buffer)
- ✅ Seamless re-authentication on token expiration
- ✅ Automatic retry on 401 errors with token refresh
- ✅ Secure storage of access and refresh tokens

---

## Token Refresh

The SDK automatically handles token refresh to keep users authenticated:

### How It Works
- Access tokens are automatically refreshed 5 minutes before expiry
- Refresh happens silently in the background
- If an API call receives a 401 error, the SDK automatically:
  1. Refreshes the access token
  2. Retries the original request
  3. If refresh fails, logs user out

### Storage
- Access token: `localStorage` (`auth_token`)
- Refresh token: `localStorage` (`auth_refresh_token`)
- Token expiry: `localStorage` (`auth_token_expiry`)

### Manual Token Refresh
```tsx
const { authClient } = useSyAuth();

// Get a valid token (auto-refreshes if needed)
const token = await authClient.getValidToken();
```

**Note:** Token refresh requires your backend to support the `refresh_token` grant type in the OAuth 2.0 token endpoint.

---

## Troubleshooting

**"redirectUri is required"**
Add `NEXT_PUBLIC_SYAUTH_REDIRECT_URI` to `.env.local`

**"Invalid redirect_uri"**
Make sure redirect URI matches exactly in your OAuth client config

**CORS errors**
Use `loginWithRedirect()` instead of the deprecated `login()` method

**Not authenticated after redirect**
Ensure you have `/auth/callback` page with `useOAuthCallback()` hook

**Users logged out unexpectedly**
Check that your backend OAuth server supports refresh tokens and hasn't blacklisted them

---

## Why SyAuth?

✅ **OAuth 2.0 + PKCE** - Industry-standard security
✅ **React Hooks** - Modern developer experience
✅ **TypeScript** - Full type safety
✅ **Full Control** - Custom login UI, complete branding
✅ **White Label** - Your brand, your domain
✅ **Self-Hosted** - Own your data and infrastructure
✅ **Open Source** - MIT licensed

---

## Links

- 📦 [NPM Package](https://www.npmjs.com/package/@syauth/nextjs)
- 🐙 [GitHub](https://github.com/syauth/nextjs-syauth)
- 📚 [Examples](https://github.com/syauth/nextjs-syauth/examples)
- 🐛 [Issues](https://github.com/syauth/nextjs-syauth/issues)

---

## License

MIT - see [LICENSE](./LICENSE)

**Built with ❤️ by [Nexorix](https://nexorix.com)**
