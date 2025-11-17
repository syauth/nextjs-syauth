'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/welcome';

  useEffect(() => {
    // Automatically redirect to Django OAuth provider
    signIn('syauth', { callbackUrl });
  }, [callbackUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Redirecting to Google OAuth...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we redirect you to Google for authentication.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
}

