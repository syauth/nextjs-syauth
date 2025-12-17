/**
 * Server-side session management for OAuth flows
 * Uses encrypted cookies to store PKCE parameters and state
 */

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'syauth_oauth_session';
const SESSION_MAX_AGE = 600; // 10 minutes

/**
 * OAuth session data stored on the server
 */
export interface OAuthSession {
  state: string;
  codeVerifier: string;
  redirectTo?: string;
  nonce?: string;
  createdAt: number;
}

/**
 * Get the secret key for JWT encryption
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.SYAUTH_SESSION_SECRET || 'default-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

/**
 * Create an encrypted OAuth session cookie
 */
export async function createOAuthSession(data: Omit<OAuthSession, 'createdAt'>): Promise<void> {
  const session: OAuthSession = {
    ...data,
    createdAt: Date.now(),
  };

  // Encrypt session data using JWT
  const token = await new SignJWT(session as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Retrieve and decrypt OAuth session from cookie
 */
export async function getOAuthSession(): Promise<OAuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as OAuthSession;
  } catch (error) {
    // Token expired or invalid
    return null;
  }
}

/**
 * Clear OAuth session cookie
 */
export async function clearOAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Validate OAuth session and state parameter
 */
export async function validateOAuthSession(receivedState: string): Promise<OAuthSession | null> {
  const session = await getOAuthSession();

  if (!session) {
    return null;
  }

  // Validate state matches
  if (session.state !== receivedState) {
    clearOAuthSession();
    return null;
  }

  // Validate session hasn't expired (double-check beyond JWT expiry)
  const age = Date.now() - session.createdAt;
  if (age > SESSION_MAX_AGE * 1000) {
    clearOAuthSession();
    return null;
  }

  return session;
}
