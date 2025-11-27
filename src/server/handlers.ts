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

  // Get optional redirect path from query params
  const redirectTo = request.nextUrl.searchParams.get('redirectTo') || undefined;

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

    // Redirect to success page with tokens in URL (will be handled client-side)
    // In production, you might want to set tokens as HTTP-only cookies instead
    const redirectUrl = new URL(session.redirectTo || '/', request.url);
    redirectUrl.searchParams.set('auth_success', 'true');
    
    const response = NextResponse.redirect(redirectUrl);
    
    // Set tokens as HTTP-only cookies (more secure than URL)
    if (tokens.access_token) {
      response.cookies.set('syauth_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokens.expires_in || 3600,
        path: '/',
      });
    }

    if (tokens.refresh_token) {
      response.cookies.set('syauth_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    clearOAuthSession();
    return NextResponse.redirect(
      new URL('/auth/error?error=Token exchange failed', request.url)
    );
  }
}
