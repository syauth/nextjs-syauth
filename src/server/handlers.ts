/**
 * Server-side OAuth route handlers
 * These handle the OAuth flow on the server to avoid client-side storage issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePKCEPair, generateState } from '../utils/pkce';
import { createOAuthSession, validateOAuthSession, clearOAuthSession } from './session';

export interface OAuthConfig {
  clientId: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  redirectUri: string;
  scope?: string;
  defaultRedirectTo?: string; // Where to redirect after successful login
}

/**
 * Handle OAuth login initiation (server-side)
 * This replaces the client-side loginWithRedirect
 */
export async function handleOAuthLogin(
  request: NextRequest,
  config: OAuthConfig
): Promise<NextResponse> {
  // Generate PKCE parameters
  const { verifier, challenge } = await generatePKCEPair();
  const state = generateState();

  // Get redirect path: query param > config default > /dashboard
  const redirectTo = request.nextUrl.searchParams.get('redirectTo') 
    || config.defaultRedirectTo 
    || '/dashboard';

  // Store session on server
  await createOAuthSession({
    state,
    codeVerifier: verifier,
    redirectTo,
  });

  // Build authorization URL
  const authUrl = new URL(config.authorizationEndpoint);
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', config.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', config.scope || 'openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  // Redirect to OAuth provider
  return NextResponse.redirect(authUrl.toString());
}

/**
 * Handle OAuth callback (server-side)
 * Validates state and exchanges code for tokens
 */
export async function handleOAuthCallback(
  request: NextRequest,
  config: OAuthConfig
): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    clearOAuthSession();
    const errorDescription = request.nextUrl.searchParams.get('error_description') || error;
    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(errorDescription)}`, request.url)
    );
  }

  // Validate required parameters
  if (!code || !state) {
    clearOAuthSession();
    return NextResponse.redirect(
      new URL('/auth/error?error=Missing code or state parameter', request.url)
    );
  }

  // Validate session and state
  const session = await validateOAuthSession(state);
  if (!session) {
    return NextResponse.redirect(
      new URL('/auth/error?error=Invalid or expired session', request.url)
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        code_verifier: session.codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json();

    // Clear OAuth session
    clearOAuthSession();

    // Redirect to success page
    // Use the origin from the redirect_uri config to handle proxies like ngrok correctly
    const redirectOrigin = new URL(config.redirectUri).origin;
    const redirectPath = session.redirectTo || '/dashboard';
    
    // Pass tokens via URL hash (fragment) so the client can set cookies
    // This works around cross-origin cookie issues (e.g., ngrok proxy)
    // The hash is never sent to the server, keeping tokens somewhat private
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in || 3600,
    };
    const encodedTokens = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    
    // Redirect to auth/success page which will set cookies and redirect to final destination
    const successUrl = new URL('/auth/success', redirectOrigin);
    successUrl.searchParams.set('redirect', redirectPath);
    successUrl.hash = `tokens=${encodedTokens}`;
    
    return NextResponse.redirect(successUrl);
  } catch (error) {
    clearOAuthSession();
    return NextResponse.redirect(
      new URL('/auth/error?error=Token exchange failed', request.url)
    );
  }
}
