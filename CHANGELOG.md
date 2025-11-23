# Changelog

All notable changes to nextjs-syauth will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-19

### 🎉 Major Release: OAuth 2.0 Authorization Code Flow with PKCE

This release introduces OAuth 2.0 as the primary authentication method, replacing the deprecated password grant flow.

### Added

#### Core OAuth 2.0 Implementation
- **PKCE Utilities** (`src/utils/pkce.ts`)
  - `generateCodeVerifier()` - Generate cryptographically random code verifier
  - `generateCodeChallenge()` - Create SHA-256 code challenge
  - `generateState()` - Generate CSRF protection state parameter
  - `storePKCEParams()` / `retrievePKCEParams()` / `clearPKCEParams()` - Session storage management

#### SDK Client Enhancements (`src/client.ts`)
- **New Config Parameters**:
  - `redirectUri` - OAuth callback URL (required for OAuth flow)
  - `scopes` - OAuth scopes (default: "openid profile email")

- **New Methods**:
  - `loginWithRedirect(redirectTo?)` - Initiate OAuth 2.0 authorization flow
  - `handleOAuthCallback(params)` - Handle OAuth callback and exchange code for token
  - `getStoredRedirectPath()` - Retrieve post-login redirect path

- **New Interfaces**:
  - `OAuthTokenResponse` - Token endpoint response type
  - `OAuthCallbackParams` - Callback URL parameters (code, state)

#### React Integration (`src/react.tsx`)
- `loginWithRedirect()` method in `useSyAuth()` hook
- `handleOAuthCallback()` method in auth context
- Automatic redirect path management

#### New Hook (`src/hooks/useOAuthCallback.ts`)
- `useOAuthCallback()` - Auto-handle OAuth callback flow
  - Parses URL parameters (code, state, error)
  - Validates state for CSRF protection
  - Exchanges authorization code for access token
  - Returns `{ loading, error, success }` state

#### Middleware Updates (`src/middleware.ts`)
- Automatic exemption of `/auth/callback` route from authentication checks
- Improved handling of OAuth callback flow

#### Documentation
- **New Files**:
  - `docs/oauth-integration.md` - Complete OAuth 2.0 integration guide
  - `docs/migration-v0.2.md` - Migration guide from v0.1.x to v0.2.0
  - `CHANGELOG.md` - This file

- **Updated Files**:
  - `README.md` - OAuth 2.0 quick start, flow diagram, troubleshooting
  - `examples/AuthDemoKit/` - Updated example with OAuth implementation

### Changed

#### Breaking Changes
- **`redirectUri` now required** in `SyAuthConfig` when using OAuth flow
  - Without it, `loginWithRedirect()` will throw an error
  - Add `NEXT_PUBLIC_REDIRECT_URI` to environment variables

#### Deprecations
- **`login(email, password)` marked as deprecated**
  - Still functional in v0.2.0 but shows console warning
  - Will be removed in v1.0.0
  - Migrate to `loginWithRedirect()` for OAuth 2.0 flow

#### Enhanced Security
- PKCE (RFC 7636) implementation prevents authorization code interception
- State parameter validation for CSRF protection
- Authorization code single-use enforcement

### Fixed
- **CORS Issues Resolved**: OAuth flow uses browser redirects instead of XHR requests
  - Login form loads on backend domain (same-origin)
  - Form submission is same-origin POST
  - Token exchange endpoint has wildcard CORS
  - No cross-origin credential requests

### Migration Guide

See [docs/migration-v0.2.md](./docs/migration-v0.2.md) for step-by-step migration instructions from v0.1.x.

**Quick Migration Steps**:
1. Update to v0.2.0: `npm install nextjs-syauth@latest`
2. Add `NEXT_PUBLIC_REDIRECT_URI` to `.env.local`
3. Pass `redirectUri` to `SyAuth` config
4. Create `/auth/callback` page with `useOAuthCallback()` hook
5. Replace `login()` calls with `loginWithRedirect()`
6. Update backend OAuth client `redirect_uris` in database

### Security

This release addresses CORS vulnerabilities and implements OAuth 2.1 best practices:
- ✅ No password transmission from third-party apps
- ✅ PKCE prevents code interception attacks
- ✅ State parameter prevents CSRF attacks
- ✅ Authorization codes are single-use
- ✅ OAuth 2.1 compliant (deprecates password grant)

---

## [0.1.4] - 2024-12-15

### Added
- Email verification resend functionality
- Profile update method with validation
- Error message sanitization utilities

### Fixed
- Form validation error handling
- Django error message parsing improvements

---

## [0.1.3] - 2024-11-20

### Added
- Password reset flow
- Email verification
- User registration with OAuth client association

### Changed
- Improved error messages from Django backend
- Better loading states in React provider

---

## [0.1.2] - 2024-10-15

### Added
- Next.js middleware for route protection
- `withAuth()` helper function
- Cookie-based authentication status

### Fixed
- Redirect loop issues
- Session persistence improvements

---

## [0.1.1] - 2024-09-10

### Added
- React context provider `SyAuthProvider`
- `useSyAuth()` hook
- Profile management methods

### Changed
- Improved TypeScript types
- Better documentation

---

## [0.1.0] - 2024-08-01

### Added
- Initial release
- Basic authentication with password grant
- Login/logout functionality
- JWT token management
- localStorage persistence

---

## Upgrade Notes

### Upgrading to v0.2.0 from v0.1.x

⚠️ **Breaking Changes**: `redirectUri` is now required for OAuth flow.

**Required Actions**:
1. Add redirect URI to environment variables
2. Create OAuth callback page
3. Update backend OAuth client configuration
4. Replace password login with OAuth redirect (recommended)

See the [Migration Guide](./docs/migration-v0.2.md) for detailed instructions.

---

## Support

For issues or questions about specific versions:
- **v0.2.0+**: OAuth 2.0 questions - See [OAuth Integration Guide](./docs/oauth-integration.md)
- **v0.1.x**: Legacy password grant - Consider upgrading to v0.2.0
- **All versions**: General support - support@nexorix.com

---

## Links

- [GitHub Repository](https://github.com/nexorix/nextjs-syauth)
- [NPM Package](https://www.npmjs.com/package/nextjs-syauth)
- [Documentation](./docs/)
- [Example App](./examples/AuthDemoKit/)
