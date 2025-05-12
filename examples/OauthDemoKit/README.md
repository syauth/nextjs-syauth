# OAuth Demo Kit

A kit demonstrating OAuth 2.0 and OpenID Connect integration with SyAuth using NextAuth.js.

## Features

- Complete OAuth 2.0 implementation with authorization code flow
- PKCE (Proof Key for Code Exchange) support for enhanced security
- Token refresh handling
- Token revocation on logout
- Typed interfaces for better developer experience
- Responsive UI with Tailwind CSS

## Code Structure

The project follows a clean, modular architecture:

- `src/auth.ts` - Main NextAuth.js configuration
- `src/middleware.ts` - Route protection middleware
- `src/utils/auth-utils.ts` - Authentication utility functions
- `src/types/next-auth.d.ts` - TypeScript type declarations
- `src/app/` - Application routes and pages
- `src/components/` - Reusable React components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```
   # Your SyAuth server base URL
   OAUTH_ISSUER_URL=<your_syauth_server_url>
   
   # Client ID from your SyAuth dashboard
   OAUTH_CLIENT_ID=<your_syauth_client_id>
   
   # Client Secret from your SyAuth dashboard
   OAUTH_CLIENT_SECRET=<your_syauth_client_secret>
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Authentication Flow

1. User clicks "Login" and is redirected to the SyAuth server
2. After successful authentication, the user is redirected back with an authorization code
3. The app exchanges the code for access and refresh tokens via NextAuth.js
4. The tokens are securely stored in HTTP-only cookies
5. When the access token expires, the app automatically uses the refresh token
6. On logout, tokens are properly revoked

## Recent Improvements

- Reduced code redundancy by moving shared functions to a utility file
- Improved type definitions with proper TypeScript interfaces
- Enhanced error handling for token refresh
- Centralized OAuth endpoint URL construction
- Better session typing for more robust type checking

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OAUTH_ISSUER_URL` | Base URL of your SyAuth provider | `https://auth.your-domain.com` |
| `OAUTH_CLIENT_ID` | OAuth client ID from SyAuth | `your-app-12345` |
| `OAUTH_CLIENT_SECRET` | OAuth client secret from SyAuth | `secret-key-xyz-98765` |

## License

MIT
