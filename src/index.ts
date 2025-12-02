import SyAuth from './client'
import { SyAuthProvider, useSyAuth } from './react'
import { withAuth } from './middleware'
import { useOAuthCallback } from './hooks/useOAuthCallback'

export { SyAuth, SyAuthProvider, useSyAuth, withAuth, useOAuthCallback }

// export types
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

export type { MiddlewareOptions } from './middleware'
export type { UseOAuthCallbackResult } from './hooks/useOAuthCallback'
