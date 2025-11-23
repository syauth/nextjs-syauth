# Migration Guide: v0.1.x → v0.2.0

This guide helps you migrate from nextjs-syauth v0.1.x (password grant) to v0.2.0 (OAuth 2.0 Authorization Code Flow with PKCE).

## Why Migrate?

**v0.1.x Issues:**
- ❌ CORS errors when used from third-party domains
- ❌ Password grant deprecated in OAuth 2.1
- ❌ Requires adding every client domain to CORS whitelist
- ❌ Less secure (credentials transmitted directly)

**v0.2.0 Benefits:**
- ✅ No CORS issues (browser redirects, not XHR)
- ✅ OAuth 2.1 compliant
- ✅ Works for unlimited domains
- ✅ More secure (PKCE protection)
- ✅ Industry standard flow

---

## Breaking Changes

### 1. New Required Config Parameter

```typescript
// v0.1.x
const syAuthClient = new SyAuth({
  apiUrl: '...',
  apiKey: '...',
  oauthClientId: '...',
})

// v0.2.0 - redirectUri now REQUIRED for OAuth flow
const syAuthClient = new SyAuth({
  apiUrl: '...',
  apiKey: '...',
  oauthClientId: '...',
  redirectUri: 'https://your-app.com/auth/callback', // NEW!
  scopes: 'openid profile email', // Optional
})
```

### 2. Login Method Changes

```typescript
// v0.1.x - Direct password login (DEPRECATED)
const { login } = useSyAuth()
await login(email, password, rememberMe)

// v0.2.0 - OAuth redirect (RECOMMENDED)
const { loginWithRedirect } = useSyAuth()
await loginWithRedirect()
```

**Note**: `login()` still works but shows a deprecation warning. It will be removed in v1.0.

### 3. New Callback Page Required

You must create a callback page to handle OAuth redirects.

---

## Step-by-Step Migration

### Step 1: Update Package

```bash
npm install nextjs-syauth@latest
```

### Step 2: Add Environment Variable

Add to `.env.local`:

```bash
NEXT_PUBLIC_REDIRECT_URI=https://your-app.com/auth/callback
```

**Development**:
```bash
NEXT_PUBLIC_REDIRECT_URI=https://localhost:3000/auth/callback
```

### Step 3: Update SyAuth Configuration

`src/syauth.config.ts`:

```typescript
import { SyAuth } from 'nextjs-syauth'

const syAuthClient = new SyAuth({
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  apiKey: process.env.NEXT_PUBLIC_API_KEY!,
  oauthClientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!,
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI!, // ADD THIS
  scopes: 'openid profile email', // Optional: customize scopes
})

export default syAuthClient
```

### Step 4: Create Callback Page

Create `src/app/auth/callback/page.tsx`:

```typescript
'use client'

import { useOAuthCallback } from 'nextjs-syauth'
import { useEffect } from 'react'

export default function CallbackPage() {
  const { loading, error, success } = useOAuthCallback()

  useEffect(() => {
    if (error) console.error('[OAuth] Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {loading && (
          <>
            <div className="loading-spinner"></div>
            <p>Completing sign in...</p>
          </>
        )}

        {error && (
          <>
            <p className="text-red-600">{error}</p>
            <a href="/login" className="btn">Return to Login</a>
          </>
        )}

        {success && <p>Success! Redirecting...</p>}
      </div>
    </div>
  )
}
```

### Step 5: Update Login Page

**Option A: Replace password login entirely (recommended)**

```typescript
'use client'

import { useSyAuth } from 'nextjs-syauth'

export default function LoginPage() {
  const { loginWithRedirect } = useSyAuth()

  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={() => loginWithRedirect()}>
        Continue with OAuth 2.0
      </button>
    </div>
  )
}
```

**Option B: Offer both methods (backward compatible)**

```typescript
'use client'

import { useState } from 'react'
import { useSyAuth } from 'nextjs-syauth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loginWithRedirect } = useSyAuth()

  const handleOAuthLogin = () => {
    loginWithRedirect()
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password) // Still works, but deprecated
  }

  return (
    <div>
      <h1>Sign In</h1>

      {/* Recommended: OAuth 2.0 */}
      <button onClick={handleOAuthLogin}>
        Sign In with OAuth 2.0 (Recommended)
      </button>

      <div>or</div>

      {/* Legacy: Password grant */}
      <form onSubmit={handlePasswordLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Sign In (Legacy)</button>
      </form>
    </div>
  )
}
```

### Step 6: Update Middleware

Update `src/middleware.ts` to exempt the callback route:

```typescript
import { NextRequest } from 'next/server'
import { withAuth } from 'nextjs-syauth'

export function middleware(request: NextRequest) {
  return withAuth(request, {
    protectedRoutes: ['/dashboard', '/profile'],
    loginUrl: '/login',
    authRoutes: [
      '/login',
      '/register',
      '/auth/callback', // ADD THIS - callback is public
    ],
  })
}
```

**Note**: The SDK automatically handles this in v0.2.0, but it's best to be explicit.

### Step 7: Update Backend OAuth Client

Connect to your s0011backend database and run:

```sql
-- View current redirect URIs
SELECT client_id, redirect_uris
FROM s0011_oauth_client
WHERE client_id = 'your-client-id';

-- Update to include callback URL
UPDATE s0011_oauth_client
SET redirect_uris = E'https://your-app.com/auth/callback\nhttps://localhost:3000/auth/callback'
WHERE client_id = 'your-client-id';

-- Verify update
SELECT client_id, redirect_uris
FROM s0011_oauth_client
WHERE client_id = 'your-client-id';
```

**Important**: Each redirect URI must be on a separate line (newline-separated).

### Step 8: Test OAuth Flow

1. Start your app: `npm run dev`
2. Navigate to `/login`
3. Click "Sign In with OAuth 2.0"
4. You should be redirected to the backend login page
5. Enter credentials
6. You should be redirected back to `/auth/callback`
7. Then redirected to `/dashboard`

**Debug checklist if it fails**:
- ✓ `redirectUri` matches exactly in .env.local
- ✓ Backend has callback URL in redirect_uris
- ✓ Callback page exists and uses `useOAuthCallback()`
- ✓ No CORS errors in browser console
- ✓ Check browser sessionStorage for PKCE parameters

---

## Common Migration Issues

### Issue 1: "redirectUri is required" Error

**Cause**: Forgot to add `redirectUri` to SyAuthConfig

**Solution**:
```typescript
const syAuthClient = new SyAuth({
  // ...
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
})
```

### Issue 2: "Invalid redirect_uri" from Backend

**Cause**: Backend OAuth client doesn't have callback URL registered

**Solution**: Run the SQL update from Step 7

### Issue 3: Callback Page Shows Blank

**Cause**: Not using `useOAuthCallback()` hook

**Solution**:
```typescript
import { useOAuthCallback } from 'nextjs-syauth'

export default function CallbackPage() {
  const { loading, error } = useOAuthCallback()
  // ...
}
```

### Issue 4: Still Getting CORS Errors

**Cause**: Still using `login()` instead of `loginWithRedirect()`

**Solution**: Replace all `login(email, password)` calls with `loginWithRedirect()`

### Issue 5: Infinite Redirect Loop

**Cause**: Middleware redirecting callback page to login

**Solution**: Add `/auth/callback` to `authRoutes` in middleware config

---

## Gradual Migration Strategy

If you have a large application, you can migrate gradually:

### Phase 1: Update SDK (Week 1)
- Update to v0.2.0
- Add `redirectUri` to config
- Keep using `login()` (deprecated but still works)

### Phase 2: Add OAuth UI (Week 2)
- Create callback page
- Add "Sign in with OAuth" button to login page
- Keep password login as fallback

### Phase 3: Monitor & Test (Week 3-4)
- Track OAuth vs password login usage
- Monitor for errors
- Gather user feedback

### Phase 4: Remove Password Login (Week 5)
- Remove password login form
- Only offer OAuth button
- Remove `login()` calls from codebase

### Phase 5: Cleanup (Week 6)
- Remove unused imports
- Update documentation
- Remove legacy code comments

---

## Rollback Plan

If you need to rollback:

```bash
# Revert to v0.1.x
npm install nextjs-syauth@0.1.4

# Remove new files
rm src/app/auth/callback/page.tsx

# Revert config changes
# Remove redirectUri from syauth.config.ts

# Revert login page to password form
```

---

## API Compatibility Matrix

| Feature | v0.1.x | v0.2.0 |
|---------|--------|--------|
| `login(email, pass)` | ✅ Supported | ⚠️ Deprecated |
| `loginWithRedirect()` | ❌ Not available | ✅ Recommended |
| `useOAuthCallback()` | ❌ Not available | ✅ New |
| `redirectUri` config | ❌ Not required | ✅ Required |
| Password grant | ✅ Primary method | ⚠️ Legacy |
| OAuth 2.0 flow | ❌ Not supported | ✅ Primary method |
| CORS issues | ❌ Common | ✅ Resolved |

---

## New TypeScript Types

```typescript
// New in v0.2.0
interface SyAuthConfig {
  apiUrl: string
  apiKey: string
  oauthClientId: string
  redirectUri?: string       // NEW
  scopes?: string           // NEW
  onLoginSuccess?: (user) => void
  onLogout?: () => void
}

interface OAuthTokenResponse {  // NEW
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
  scope?: string
}

interface OAuthCallbackParams {  // NEW
  code: string
  state: string
}

interface UseOAuthCallbackResult {  // NEW
  loading: boolean
  error: string | null
  success: boolean
}
```

---

## Need Help?

- **Documentation**: See [oauth-integration.md](./oauth-integration.md)
- **Example App**: Check `examples/AuthDemoKit/`
- **Troubleshooting**: See [OAuth Integration Guide - Troubleshooting](./oauth-integration.md#troubleshooting)
- **Support**: support@yourdomain.com

---

## Deprecation Timeline

- **v0.2.0** (Current): `login()` deprecated, shows console warning
- **v0.3.0** (Q2 2024): `login()` marked as legacy
- **v1.0.0** (Q4 2024): `login()` removed entirely

Migrate now to avoid breaking changes in v1.0.0!
