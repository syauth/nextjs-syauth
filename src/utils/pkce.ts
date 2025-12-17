/**
 * PKCE (Proof Key for Code Exchange) Utilities
 *
 * Implements RFC 7636 for OAuth 2.0 public clients.
 * https://datatracker.ietf.org/doc/html/rfc7636
 */

/**
 * Base64 URL encode a string
 * Converts standard base64 to URL-safe base64 (RFC 4648 Section 5)
 */
function base64URLEncode(str: ArrayBuffer): string {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(str)));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate a cryptographically random string
 * @param length - Length of the string (default: 43-128 as per RFC 7636)
 */
function generateRandomString(length: number = 43): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  return Array.from(randomValues)
    .map(value => charset[value % charset.length])
    .join('');
}

/**
 * Generate a code verifier for PKCE
 * A cryptographically random string between 43-128 characters
 *
 * @returns A URL-safe random string
 */
export function generateCodeVerifier(): string {
  return generateRandomString(128); // Maximum recommended length for better security
}

/**
 * Generate a code challenge from a code verifier
 * Uses SHA-256 hash and base64url encoding (S256 method)
 *
 * @param verifier - The code verifier to hash
 * @returns A promise that resolves to the code challenge
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(hash);
}

/**
 * Generate a random state parameter for CSRF protection
 *
 * @returns A random string to use as the state parameter
 */
export function generateState(): string {
  return generateRandomString(32);
}

/**
 * Generate both code verifier and challenge
 * Convenience method for PKCE flow initialization
 *
 * @returns Object containing verifier and challenge
 */
export async function generatePKCEPair(): Promise<{
  verifier: string;
  challenge: string;
}> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  return {
    verifier,
    challenge,
  };
}

/**
 * Storage keys for PKCE parameters
 */
export const PKCE_STORAGE_KEYS = {
  CODE_VERIFIER: 'syauth_code_verifier',
  STATE: 'syauth_state',
  REDIRECT_TO: 'syauth_redirect_to',
  PKCE_SESSION_ID: 'syauth_pkce_session_id',
} as const;

/**
 * Set a cookie
 */
function setCookie(name: string, value: string, maxAgeSeconds: number = 600): void {
  if (typeof document === 'undefined') return;
  
  // Use SameSite=Lax to allow cookies to be sent on OAuth redirects
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax; Secure`;
}

/**
 * Get a cookie value
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

/**
 * Delete a cookie
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax; Secure`;
}

/**
 * Store PKCE parameters in cookies (more reliable than sessionStorage for OAuth flows)
 * Also stores in URL hash as a fallback for private browsing mode
 *
 * @param verifier - Code verifier to store
 * @param state - State parameter to store
 * @param redirectTo - Optional redirect path after authentication
 */
export function storePKCEParams(
  verifier: string,
  state: string,
  redirectTo?: string
): void {
  if (typeof window === 'undefined') return;

  // Store in cookies with 10 minute expiry
  setCookie(PKCE_STORAGE_KEYS.CODE_VERIFIER, verifier, 600);
  setCookie(PKCE_STORAGE_KEYS.STATE, state, 600);

  if (redirectTo) {
    setCookie(PKCE_STORAGE_KEYS.REDIRECT_TO, redirectTo, 600);
  }
  
  // FALLBACK: Also store in URL hash for private browsing mode where cookies may be blocked
  // This survives page reloads and Fast Refresh
  const hashData = {
    v: verifier,
    s: state,
    r: redirectTo,
  };
  window.location.hash = `pkce=${encodeURIComponent(btoa(JSON.stringify(hashData)))}`;
}

/**
 * Retrieve PKCE parameters from cookies or URL hash fallback
 *
 * @returns Object containing stored PKCE parameters
 */
export function retrievePKCEParams(): {
  verifier: string | null;
  state: string | null;
  redirectTo: string | null;
} {
  if (typeof window === 'undefined') {
    return { verifier: null, state: null, redirectTo: null };
  }

  // Try cookies first
  let verifier = getCookie(PKCE_STORAGE_KEYS.CODE_VERIFIER);
  let state = getCookie(PKCE_STORAGE_KEYS.STATE);
  let redirectTo = getCookie(PKCE_STORAGE_KEYS.REDIRECT_TO);
  
  // FALLBACK: If cookies are null, try URL hash
  if (!state && window.location.hash) {
    try {
      const hashMatch = window.location.hash.match(/pkce=([^&]+)/);
      if (hashMatch) {
        const hashData = JSON.parse(atob(decodeURIComponent(hashMatch[1])));
        verifier = hashData.v;
        state = hashData.s;
        redirectTo = hashData.r;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  return {
    verifier,
    state,
    redirectTo,
  };
}

/**
 * Clear PKCE parameters from cookies and URL hash
 * Should be called after successful token exchange or on error
 */
export function clearPKCEParams(): void {
  if (typeof window === 'undefined') return;

  deleteCookie(PKCE_STORAGE_KEYS.CODE_VERIFIER);
  deleteCookie(PKCE_STORAGE_KEYS.STATE);
  deleteCookie(PKCE_STORAGE_KEYS.REDIRECT_TO);
  deleteCookie(PKCE_STORAGE_KEYS.PKCE_SESSION_ID);
  
  // Clear URL hash
  if (window.location.hash.includes('pkce=')) {
    window.location.hash = '';
  }
}

/**
 * Server-side PKCE session response
 */
export interface ServerPKCESession {
  sessionId: string;
  codeChallenge: string;
  codeChallengeMethod: string;
}

/**
 * Initialize PKCE session on server
 * 
 * This stores code_verifier server-side to avoid cross-origin issues
 * where the Next.js app's cookies aren't accessible from Django-rendered pages.
 * 
 * @param apiUrl - The backend API URL
 * @param clientId - The OAuth client ID
 * @returns Server PKCE session with session_id and code_challenge
 */
export async function initServerPKCE(
  apiUrl: string, 
  clientId: string
): Promise<ServerPKCESession> {
  const response = await fetch(`${apiUrl}/oauth/pkce/init/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ client_id: clientId }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to initialize PKCE session');
  }
  
  const data = await response.json();
  
  return {
    sessionId: data.session_id,
    codeChallenge: data.code_challenge,
    codeChallengeMethod: data.code_challenge_method,
  };
}

/**
 * Store server PKCE session ID and state
 * 
 * @param sessionId - PKCE session ID from server
 * @param state - State parameter for CSRF protection
 * @param redirectTo - Optional redirect path after authentication
 */
export function storeServerPKCEParams(
  sessionId: string,
  state: string,
  redirectTo?: string
): void {
  if (typeof window === 'undefined') return;

  // Store in cookies with 10 minute expiry
  setCookie(PKCE_STORAGE_KEYS.PKCE_SESSION_ID, sessionId, 600);
  setCookie(PKCE_STORAGE_KEYS.STATE, state, 600);

  if (redirectTo) {
    setCookie(PKCE_STORAGE_KEYS.REDIRECT_TO, redirectTo, 600);
  }
}

/**
 * Retrieve server PKCE session parameters
 * 
 * @returns Object containing stored PKCE session parameters
 */
export function retrieveServerPKCEParams(): {
  sessionId: string | null;
  state: string | null;
  redirectTo: string | null;
} {
  if (typeof window === 'undefined') {
    return { sessionId: null, state: null, redirectTo: null };
  }

  const sessionId = getCookie(PKCE_STORAGE_KEYS.PKCE_SESSION_ID);
  const state = getCookie(PKCE_STORAGE_KEYS.STATE);
  const redirectTo = getCookie(PKCE_STORAGE_KEYS.REDIRECT_TO);

  return {
    sessionId,
    state,
    redirectTo,
  };
}
