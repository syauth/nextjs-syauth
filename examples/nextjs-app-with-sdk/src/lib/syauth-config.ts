import { SyAuthConfig } from '@syauth/nextjs'

/**
 * SyAuth SDK Configuration
 * This configures the SDK to work with your SyAuth backend
 */
export const syAuthConfig: SyAuthConfig = {
  apiUrl: process.env.NEXT_PUBLIC_SYAUTH_API_URL!,
  oauthClientId: process.env.NEXT_PUBLIC_SYAUTH_CLIENT_ID!,
  redirectUri: process.env.NEXT_PUBLIC_SYAUTH_REDIRECT_URI!,
  apiKey: process.env.NEXT_PUBLIC_SYAUTH_API_KEY,
  workspaceId: process.env.NEXT_PUBLIC_SYAUTH_WORKSPACE_ID,
  scopes: process.env.NEXT_PUBLIC_SYAUTH_SCOPES || 'openid profile email',

  onLoginSuccess: (user) => {
    console.log('User logged in:', user)
  },
  onLogout: () => {
    console.log('User logged out')
  },
}
