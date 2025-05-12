declare module 'next-auth' {
  /**
   * Extending the Session type
   */
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      company?: string | null
      job_title?: string | null
      phone_number?: string | null
      user_type?: string | null
      created_at?: number | null
      updated_at?: number | null
      last_login?: number | null
    }
    accessToken?: string
    error?: string
  }

  /**
   * Extending the User type
   */
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    company?: string | null
    job_title?: string | null
    phone_number?: string | null
    user_type?: string | null
    created_at?: number | null
    updated_at?: number | null
    last_login?: number | null
  }
}

// Extending JWT type to store the fields
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
    user?: {
      id: string
      name?: string | null
      email?: string | null
      company?: string | null
      job_title?: string | null
      phone_number?: string | null
      user_type?: string | null
      created_at?: number | null
      updated_at?: number | null
      last_login?: number | null
    }
  }
}
