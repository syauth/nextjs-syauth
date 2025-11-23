import SyAuth from './client'
import { SyAuthProvider, useSyAuth } from './react'
import { useOAuthCallback } from './hooks/useOAuthCallback'

/**
 * Core SyAuth client instance for client-side usage
 * @example
 * ```tsx
 * const authClient = new SyAuth(config)
 * ```
 */
export { SyAuth }

/**
 * React provider component that wraps your app and provides authentication context
 * @example
 * ```tsx
 * <SyAuthProvider config={config}>
 *   <App />
 * </SyAuthProvider>
 * ```
 */
export { SyAuthProvider }

/**
 * React hook to access authentication state and methods
 * @example
 * ```tsx
 * const { user, isAuthenticated, loginWithRedirect } = useSyAuth()
 * ```
 */
export { useSyAuth }

/**
 * React hook to handle OAuth callback flow
 * @example
 * ```tsx
 * const { loading, error, success } = useOAuthCallback()
 * ```
 */
export { useOAuthCallback }

export type {
  AuthUser,
  AuthResponse,
  SyAuthConfig,
  ProfileUpdateData,
  RegisterData,
  PasswordResetConfirmData,
  VerificationResponse,
  PasswordResetResponse,
  OAuthTokenResponse,
  OAuthCallbackParams,
} from './client'

export type { UseOAuthCallbackResult } from './hooks/useOAuthCallback'
