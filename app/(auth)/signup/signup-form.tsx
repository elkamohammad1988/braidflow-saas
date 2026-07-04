'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupAction } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Role = 'client' | 'braider';

export function SignupForm({ defaultRole }: { defaultRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(defaultRole);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await signupAction({
      email: String(fd.get('email')),
      password: String(fd.get('password')),
      fullName: String(fd.get('full_name')),
      role
    });
    if ('error' in result) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.push(result.role === 'braider' ? '/dashboard' : '/braiders');
    router.refresh();
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
              aria-pressed={role === r}
              onClick={() => setRole(r)}
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ease-spring active:scale-[0.98]',
                role === r
                  ? 'border-transparent bg-gradient-to-br from-onyx-soft to-night text-cream shadow-soft ring-1 ring-gold/25'
                  : 'border-line-strong bg-paper text-ink hover:-translate-y-px hover:border-clay/40 hover:bg-gold/[0.03]'
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

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

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
