import { NextRequest } from 'next/server';
import { handleOAuthCallback } from '@syauth/nextjs/server';

const config = {
  clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || process.env.NEXT_PUBLIC_SYAUTH_CLIENT_ID || 'f9a99dc2-b2c5-407c-8344-fd3ad7eb870d',
  authorizationEndpoint: process.env.NEXT_PUBLIC_OAUTH_AUTHORIZATION_ENDPOINT || `${process.env.NEXT_PUBLIC_SYAUTH_API_URL || 'https://dlf0010alm01.master.nx:8002/e/v1'}/oauth/authorize/`,
  tokenEndpoint: process.env.NEXT_PUBLIC_OAUTH_TOKEN_ENDPOINT || `${process.env.NEXT_PUBLIC_SYAUTH_API_URL || 'https://dlf0010alm01.master.nx:8002/e/v1'}/oauth/token/`,
  redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || process.env.NEXT_PUBLIC_SYAUTH_REDIRECT_URI || 'https://dlf0010alm01.master.nx:3002/auth/callback',
  scope: 'openid profile email',
};

export async function GET(request: NextRequest) {
  return handleOAuthCallback(request, config);
}
