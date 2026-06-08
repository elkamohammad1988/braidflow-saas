'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export function SignOutLink({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      await supabaseBrowser().auth.signOut();
      router.push('/');
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className={cn(
        'inline-flex items-center text-sm text-ink-muted hover:text-ink disabled:opacity-50',
        className
      )}
    >
      {pending && <Spinner className="mr-1.5 h-3 w-3" />}
      Sign out
    </button>
  );
}
