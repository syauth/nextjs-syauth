# SyAuth SDK for Next.js

A SyAuth SDK for NextJS by Nexorix.

## Installation

```bash
npm install nextjs-syauth
# or
yarn add nextjs-syauth
```

## Quick Start

### 1. Environment Variables

**⚠️ Security Note:** Never commit `.env.local` to version control!

Create a `.env.local` file with your SyAuth credentials:

```bash
# SyAuth API Configuration
NEXT_PUBLIC_API_URL=https://api.syauth.com/e/v1
NEXT_PUBLIC_API_KEY=your_api_key_here
NEXT_PUBLIC_OAUTH_CLIENT_ID=your_oauth_client_id_here
```

### 2. Initialize the Auth Client

```typescript
// syauth.config.ts
import { SyAuth } from 'nextjs-syauth';

// Validate required environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is required');
}
if (!API_KEY) {
  throw new Error('NEXT_PUBLIC_API_KEY is required');
}
if (!OAUTH_CLIENT_ID) {
  throw new Error('NEXT_PUBLIC_OAUTH_CLIENT_ID is required');
}

const syAuthClient = new SyAuth({
  apiUrl: API_URL,
  apiKey: API_KEY,
  oauthClientId: OAUTH_CLIENT_ID,
});

export default syAuthClient;
```

**Note:** The configuration will throw clear error messages if environment variables are missing, helping you set up the SDK correctly.

### 3. Add the Auth Provider to your Layout

```typescript
// app/layout.tsx
'use client';

import { SyAuthProvider } from 'nextjs-syauth';
import syAuthClient from '@/syauth.config';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SyAuthProvider
          authClient={syAuthClient}
          redirectAfterLogin="/dashboard"
          unauthorizedRedirect="/login"
        >
          {children}
        </SyAuthProvider>
      </body>
    </html>
  );
}
```

### 4. Add Route Protection with Middleware

```typescript
// middleware.ts
import { NextRequest } from 'next/server';
import { withAuth } from 'nextjs-syauth';

export function middleware(request: NextRequest) {
  return withAuth(request, {
    protectedRoutes: ['/dashboard', '/profile'],
    loginUrl: '/login',
    defaultProtectedRoute: '/dashboard',
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 5. Use the Auth Hook in Your Components

```typescript
'use client';

import { useSyAuth } from 'nextjs-syauth';

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useSyAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.first_name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>You need to log in</p>
      )}
    </div>
  );
}
```

## Features

- Authentication state management
- Protected routes with middleware
- Login, registration, and password reset flows
- Email verification
- User profile management

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## License

MIT
