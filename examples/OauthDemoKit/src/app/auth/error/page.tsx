'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NextAuthConfig {
  authURL: string;
  tokenURL: string;
  userinfoURL: string;
  callbackURL: string;
}

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [allParams, setAllParams] = useState<Record<string, string>>({});
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [nextAuthConfig, setNextAuthConfig] = useState<NextAuthConfig | null>(
    null
  );

  useEffect(() => {
    // Get all URL parameters
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    setAllParams(params);

    // Get environment variables
    const env = {
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL || 'Not set',
      OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID
        ? 'Set (starts with: ' +
          process.env.OAUTH_CLIENT_ID.substring(0, 4) +
          '...)'
        : 'Not set',
      OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET
        ? 'Set (length: ' + process.env.OAUTH_CLIENT_SECRET.length + ')'
        : 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
        ? 'Set (length: ' + process.env.NEXTAUTH_SECRET.length + ')'
        : 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
    };
    setEnvVars(env);

    // Attempt to read NextAuth config details
    try {
      const configDetails = {
        authURL: `${process.env.NEXT_PUBLIC_API_URL}/oauth/authorize/`,
        tokenURL: `${process.env.NEXT_PUBLIC_API_URL}/oauth/token/`,
        userinfoURL: `${process.env.NEXT_PUBLIC_API_URL}/oauth/userinfo/`,
        callbackURL: `${process.env.NEXTAUTH_URL}/api/auth/callback/django`,
      };
      setNextAuthConfig(configDetails);
    } catch (e) {
      console.error('Error getting config details:', e);
    }

    // Log to console
    console.error('Auth Error Details:', params, env);
  }, [searchParams]);

  // Error message lookup
  const getErrorMessage = () => {
    const messages: Record<string, string> = {
      Configuration: 'There is a problem with the OAuth configuration.',
      AccessDenied: 'You denied access to the application.',
      OAuthSignin: 'Error starting the OAuth signin flow.',
      OAuthCallback: 'Error in the OAuth callback.',
      OAuthCreateAccount: 'Error creating a user account.',
      EmailCreateAccount: 'Could not create email account.',
      Callback: 'Error in the OAuth callback.',
      OAuthAccountNotLinked: 'Email already exists with different provider.',
      EmailSignin: 'Error sending the email for sign in.',
      CredentialsSignin: 'Sign in failed. Check your credentials.',
      SessionRequired: 'You must be signed in to access this page.',
      Default: 'An unknown authentication error occurred.',
    };
    return error ? messages[error] || messages.Default : messages.Default;
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Error
        </h1>
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-red-800 font-semibold">{getErrorMessage()}</p>
          {error && (
            <p className="text-gray-700 mt-2">
              Error code: <span className="font-mono">{error}</span>
            </p>
          )}

          {/* Details Section */}
          <div className="mt-4">
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                Debug Information (Click to expand)
              </summary>

              <div className="mt-2">
                <p className="text-sm font-semibold text-gray-700">
                  All Error Details:
                </p>
                <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-xs text-gray-800 max-h-60">
                  {JSON.stringify(allParams, null, 2)}
                </pre>
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700">
                  Environment Variables:
                </p>
                <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-xs text-gray-800 max-h-60">
                  {JSON.stringify(envVars, null, 2)}
                </pre>
              </div>

              {nextAuthConfig && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700">
                    NextAuth Configuration:
                  </p>
                  <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-xs text-gray-800 max-h-60">
                    {JSON.stringify(nextAuthConfig, null, 2)}
                  </pre>
                </div>
              )}
            </details>
          </div>

          {/* Callback URL check */}
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700">
              Expected Callback URL (must match Django OAuth Client):
            </p>
            <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-xs text-gray-800">
              {process.env.NEXTAUTH_URL
                ? `${process.env.NEXTAUTH_URL}/api/auth/callback/django`
                : 'Could not determine - NEXTAUTH_URL not set'}
            </pre>
          </div>

          {/* Specific checks section */}
          <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 font-semibold">
              Common issues to check:
            </p>
            <ul className="mt-2 text-sm text-yellow-800 list-disc ml-5">
              <li>Verify your OAuth client ID and secret are correct</li>
              <li>
                Make sure the redirect URI exactly matches in both NextAuth and
                Django
              </li>
              <li>
                Check if HTTPS certificates are valid (try with HTTP for
                testing)
              </li>
              <li>Verify CORS is properly configured on Django</li>
              <li>
                Check Django server logs for any errors during token exchange
              </li>
              <li>Try clearing browser cache and cookies</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Return to Home
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
