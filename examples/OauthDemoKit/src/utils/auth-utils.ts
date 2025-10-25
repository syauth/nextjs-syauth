/**
 * Utility functions for authentication and token handling
 */

// Get configuration from environment variables
const OAUTH_ISSUER_URL = process.env.NEXT_PUBLIC_OAUTH_ISSUER_URL;
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

/**
 * Create a token endpoint URL
 */
export const getTokenUrl = (): string => {
  return `${OAUTH_ISSUER_URL}/oauth/token/`;
};

/**
 * Create a token revocation endpoint URL
 */
export const getTokenRevocationUrl = (): string => {
  return `${OAUTH_ISSUER_URL}/oauth/revoke/`;
};

/**
 * Create basic client credentials parameters
 */
export const getClientCredentials = (): URLSearchParams => {
  return new URLSearchParams({
    client_id: OAUTH_CLIENT_ID as string,
    client_secret: OAUTH_CLIENT_SECRET as string,
  });
};

/**
 * Format a Unix timestamp to a readable date string
 */
export const formatDate = (timestamp: number | null | undefined): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

/**
 * Extract user profile data from the profile object
 */
export const extractUserProfile = (profile: any) => {
  // Check if any name information is available
  let name = null;
  if (profile.name) {
    name = profile.name;
  } else if (profile.given_name || profile.family_name) {
    name =
      `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || null;
  }

  return {
    id: profile.sub,
    name: name,
    email: profile.email,
    image: profile.picture || null,
    company: profile.company || null,
    job_title: profile.job_title || null,
    phone_number: profile.phone_number || null,
    user_type: profile.user_type || null,
    created_at: profile.created_at || null,
    updated_at: profile.updated_at || null,
    last_login: profile.last_login || null,
  };
};

/**
 * Get standard error message for token refresh errors
 */
export const getRefreshTokenErrorMessage = (): string => {
  return 'RefreshAccessTokenError';
};
