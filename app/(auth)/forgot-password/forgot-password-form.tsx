'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { requestPasswordReset } from '@/lib/auth/password-reset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once the request succeeds — flips to a generic "check your inbox"
  // screen. We show this whether or not the email maps to an account, so the
  // page can never be used to probe which addresses are registered.
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email'));
    const res = await requestPasswordReset(email);
    if (!res.ok) {
      setError(res.error);
      setPending(false);
      return;
    }
    setSentTo(email);
    setPending(false);
  }

  if (sentTo) {
    return (
      <div className="motion-safe:animate-fade-in-up space-y-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-moss/10 text-moss">
          <MailCheck className="h-6 w-6" strokeWidth={1.9} />
        </span>
        <div>
          <h2 className="font-display text-xl text-ink">Check your inbox</h2>
          <p className="mt-1 text-sm text-ink-muted">
            If an account exists for{' '}
            <span className="font-medium text-ink">{sentTo}</span>, we&apos;ve sent a link to
            reset your password. It expires in about an hour.
          </p>
        </div>
        <p className="text-sm text-ink-muted">
          Didn&apos;t get it? Check spam, or{' '}
          <button
            type="button"
            onClick={() => {
              setSentTo(null);
              setError(null);
            }}
            className="font-medium text-ink hover:underline underline-offset-4"
          >
            try again
          </button>
          .
        </p>
        <p className="text-sm text-ink-muted">
          <Link href="/login" className="font-medium text-ink hover:underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input name="email" type="email" label="Email" autoComplete="email" required />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Sending link…' : 'Send reset link'}
      </Button>
    </form>
  );
}
