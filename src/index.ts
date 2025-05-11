import SyAuth from './client'
import { SyAuthProvider, useSyAuth } from './react'
import { withAuth } from './middleware'

export { SyAuth, SyAuthProvider, useSyAuth, withAuth }

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
} from './client'

export type { MiddlewareOptions } from './middleware'
