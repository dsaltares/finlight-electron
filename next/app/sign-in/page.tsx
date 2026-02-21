'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import GoogleIcon from '@/components/icons/google';
import authClient from '@/lib/authClient';

export default function SignInPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await authClient.signIn.social({ provider: 'google' });
    } catch (error) {
      setIsSigningIn(false);
      toast.error('Failed to sign in with Google', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-border bg-card px-8 py-10 text-center shadow-sm">
        <div className="flex items-center justify-center rounded-2xl p-4">
          <Image
            src="/logo-no-text.svg"
            alt="Finlight logo"
            width={128}
            height={128}
            priority
          />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-foreground">
          Welcome to Finlight
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to continue managing your finances.
        </p>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="h-5 w-5">
            <GoogleIcon />
          </span>
          {isSigningIn ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>
    </main>
  );
}
