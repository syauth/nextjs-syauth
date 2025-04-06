import NexoAuth from './client'
import { NexoAuthProvider, useNexoAuth } from './react'
import { withAuth } from './middleware'

export { NexoAuth, NexoAuthProvider, useNexoAuth, withAuth }

// export types
export type {
  AuthUser,
  AuthResponse,
  NexoAuthConfig,
  ProfileUpdateData,
  RegisterData,
  PasswordResetConfirmData,
  VerificationResponse,
  PasswordResetResponse,
} from './client'

export type { MiddlewareOptions } from './middleware'
