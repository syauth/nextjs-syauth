import { NextRequest, NextResponse } from 'next/server';
import { getOAuthSession, clearOAuthSession } from '@syauth/nextjs/server';

/**
 * API endpoint to validate OAuth state parameter against server session
 * This allows the client-side callback to validate state without relying on client-side storage
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, code } = body;

    if (!state || !code) {
      return NextResponse.json(
        { valid: false, error: 'Missing state or code parameter' },
        { status: 400 }
      );
    }

    // Retrieve server session
    const session = await getOAuthSession();

    if (!session) {
      return NextResponse.json(
        { valid: false, error: 'No active OAuth session found' },
        { status: 401 }
      );
    }

    // Validate state matches
    if (session.state !== state) {
      await clearOAuthSession();
      return NextResponse.json(
        { valid: false, error: 'State parameter mismatch' },
        { status: 401 }
      );
    }

    // State is valid, return the code verifier
    return NextResponse.json({
      valid: true,
      codeVerifier: session.codeVerifier,
      redirectTo: session.redirectTo,
    });
  } catch (error) {
    console.error('[OAuth Validate] Error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
