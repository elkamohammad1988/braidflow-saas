'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email: String(fd.get('email')),
      password: String(fd.get('password')),
      options: {
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
    router.push(role === 'braider' ? '/dashboard' : '/braiders');
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
    </form>
  );
}
