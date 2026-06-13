'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Role = 'client' | 'braider';

export function SignupForm({ defaultRole }: { defaultRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(defaultRole);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once a confirmation email has been sent — flips the form to a
  // "check your inbox" screen instead of redirecting into a gated route the
  // user can't reach yet (they have no session until they verify).
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email'));
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: String(fd.get('password')),
      options: {
        // Where Supabase sends the user after they click the confirmation link.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          role,
          full_name: String(fd.get('full_name'))
        }
      }
    });
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    // No session means email confirmation is enabled — the user must verify
    // before they have a session. Show the verification screen rather than
    // bouncing them off a protected route.
    if (!data.session) {
      // Supabase obfuscates an existing-email signup by returning a user with
      // no identities (and no error). Point them at sign-in instead of an
      // email that will never arrive.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('An account with this email already exists. Try signing in instead.');
        setPending(false);
        return;
      }
      setSentTo(email);
      setPending(false);
      return;
    }

    // Confirmation disabled — the session is live, go straight in.
    router.push(role === 'braider' ? '/dashboard' : '/braiders');
    router.refresh();
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
            We sent a confirmation link to{' '}
            <span className="font-medium text-ink">{sentTo}</span>. Click it to verify
            your email and finish setting up your account.
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
            try a different email
          </button>
          .
        </p>
        <p className="text-sm text-ink-muted">
          Already verified?{' '}
          <Link href="/login" className="font-medium text-ink hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">I'm signing up as a</legend>
        <div className="grid grid-cols-2 gap-2">
          {(['client', 'braider'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                'rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                role === r
                  ? 'border-ink bg-ink text-cream'
                  : 'border-ink/10 bg-white text-ink hover:border-ink/25'
              )}
            >
              {r === 'client' ? 'Client' : 'Braider'}
            </button>
          ))}
        </div>
      </fieldset>

      <Input name="full_name" label="Full name" autoComplete="name" required />
      <Input name="email" type="email" label="Email" autoComplete="email" required />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        minLength={8}
        required
        hint="At least 8 characters."
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-xs leading-relaxed text-ink-muted">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="font-medium text-ink hover:underline underline-offset-4">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="font-medium text-ink hover:underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
