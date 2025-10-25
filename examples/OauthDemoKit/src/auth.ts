import NextAuth from 'next-auth';
import {
  getTokenUrl,
  getTokenRevocationUrl,
  getClientCredentials,
  extractUserProfile,
  getRefreshTokenErrorMessage,
} from './utils/auth-utils';

// Get configuration from environment variables
const OAUTH_ISSUER_URL = process.env.NEXT_PUBLIC_OAUTH_ISSUER_URL;
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

// Auto-generate NextAuth secret if not provided
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 
  require('crypto').randomBytes(32).toString('hex');

// Debug logging
console.log('OAuth Configuration Debug:');
console.log('OAUTH_ISSUER_URL:', OAUTH_ISSUER_URL);
console.log('OAUTH_CLIENT_ID:', OAUTH_CLIENT_ID ? 'Set' : 'Not set');
console.log('OAUTH_CLIENT_SECRET:', OAUTH_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('NEXTAUTH_SECRET:', NEXTAUTH_SECRET ? 'Auto-generated' : 'Not set');

// Validate required environment variables
if (!OAUTH_ISSUER_URL) {
  throw new Error('NEXT_PUBLIC_OAUTH_ISSUER_URL is required');
}
if (!OAUTH_CLIENT_ID) {
  throw new Error('OAUTH_CLIENT_ID is required');
}
if (!OAUTH_CLIENT_SECRET) {
  throw new Error('OAUTH_CLIENT_SECRET is required');
}

interface UserProfile {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
  [key: string]: any;
}

interface TokenContext {
  provider: {
    token?: {
      url: string;
    };
    [key: string]: any;
  };
  params?: {
    code?: string;
    redirect_uri?: string;
    code_verifier?: string;
    refresh_token?: string;
    [key: string]: any;
  };
}

export const config = {
  providers: [
    {
      id: 'syauth',
      name: 'Syauth OAuth',
      type: 'oauth',

      // OAuth2 with OIDC - Django returns ID tokens
      // Set issuer to match Django's OIDC_ISSUER
      issuer: OAUTH_ISSUER_URL,
      authorization: `${OAUTH_ISSUER_URL}/oauth/authorize/`,
      token: getTokenUrl(),
      userinfo: `${OAUTH_ISSUER_URL}/oauth/userinfo/`,

      // Client credentials
      clientId: OAUTH_CLIENT_ID,
      clientSecret: OAUTH_CLIENT_SECRET,

      // OAuth2 scopes - removed 'openid' to disable OIDC validation
      scope: 'email profile',

      // Security checks
      checks: ['pkce', 'state'],

      // Profile mapping
      profile(profile: UserProfile) {
        return extractUserProfile(profile);
      },
    },
  ],

  callbacks: {
    // @ts-ignore
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: Math.floor(
            Date.now() / 1000 + ((account.expires_in as number) || 3600)
          ),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            company: user.company || null,
            job_title: user.job_title || null,
            phone_number: user.phone_number || null,
            user_type: user.user_type || null,
            created_at: user.created_at || null,
            updated_at: user.updated_at || null,
            last_login: user.last_login || null,
          },
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      if (token.refreshToken) {
        try {
          // Make a refresh token request
          const tokenUrl = getTokenUrl();
          const params = getClientCredentials();
          params.append('grant_type', 'refresh_token');
          params.append('refresh_token', token.refreshToken as string);

          const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          });

          const text = await response.text();
          const tokens = text ? JSON.parse(text) : null;

          if (!response.ok) throw tokens;

          if (!tokens) {
            throw new Error('Received empty token response from server');
          }

          return {
            ...token,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? token.refreshToken,
            expiresAt: Math.floor(
              Date.now() / 1000 + (tokens.expires_in || 3600)
            ),
          };
        } catch (error) {
          console.error('Error refreshing access token', error);
          return {
            ...token,
            error: getRefreshTokenErrorMessage(),
          };
        }
      }

      return token;
    },

    // @ts-ignore
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.id = token.sub ?? (token.user?.id as string);

      // Explicitly copy over all user data from token
      if (token.user) {
        session.user.name = token.user.name || null;
        session.user.email = token.user.email || null;
        session.user.company = token.user.company || null;
        session.user.job_title = token.user.job_title || null;
        session.user.phone_number = token.user.phone_number || null;
        session.user.user_type = token.user.user_type || null;
        session.user.created_at = token.user.created_at || null;
        session.user.updated_at = token.user.updated_at || null;
        session.user.last_login = token.user.last_login || null;
      }

      return session;
    },
  },

  events: {
    // @ts-ignore
    async signOut({ token }) {
      // Call to revoke the token
      if (token?.accessToken) {
        try {
          const revokeUrl = getTokenRevocationUrl();
          const params = getClientCredentials();
          params.append('token', token.accessToken as string);
          params.append('token_type_hint', 'access_token');

          await fetch(revokeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          });
        } catch (error) {
          console.error('Error revoking token', error);
        }
      }
    },
  },

  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Environment-dependent configurations
  debug: process.env.NODE_ENV === 'development',
  secret: NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

// @ts-ignore
export const { handlers, auth, signIn, signOut } = NextAuth(config);
