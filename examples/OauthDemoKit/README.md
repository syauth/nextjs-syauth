# SyAuth OAuth Demo Kit

A simple Next.js application demonstrating OAuth integration with SyAuth.

## Quick Setup

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 2. Required Environment Variables

You only need to provide these **3 variables**:

```bash
# OAuth Server Configuration
NEXT_PUBLIC_API_URL=https://api.syauth.com/e/v1

# OAuth Client Credentials (Get these from your SyAuth dashboard)
OAUTH_CLIENT_ID=your_client_id_here
OAUTH_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
```

### 3. Install and Run

```bash
npm install
npm run dev
```

### 4. Optional: Development with ngrok

For OAuth testing with external providers, you may need a public URL:

```bash
# Install ngrok globally (optional)
npm install -g ngrok

# Start ngrok tunnel (optional)
npm run dev:ngrok
```

**Note:** ngrok is only needed for OAuth testing with external providers. For local development without OAuth, you can use `npm run dev` directly.

## What's Included

- ✅ **Auto-generated NextAuth secret** - No manual configuration needed
- ✅ **OAuth 2.0 + OIDC integration** with SyAuth
- ✅ **Google OAuth flow** through SyAuth
- ✅ **User profile display** with all available fields
- ✅ **Secure session management**

## How It Works

1. **User clicks "Sign in with Google"**
2. **NextAuth redirects to SyAuth OAuth endpoint**
3. **SyAuth redirects to Google OAuth**
4. **User authenticates with Google**
5. **Google redirects back to SyAuth**
6. **SyAuth redirects back to NextAuth**
7. **User is logged in!**

## Development

The application automatically generates a secure NextAuth secret if not provided, making setup as simple as possible for developers.

## Production

For production deployments, you can optionally set `NEXTAUTH_SECRET` in your environment variables for consistency across deployments.
