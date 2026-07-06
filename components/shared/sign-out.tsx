'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/lib/auth/actions';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export function SignOutLink({ className }: { className?: string }) {
  const t = useTranslations('common');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      await logoutAction();
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
      {pending && <Spinner className="me-1.5 h-3 w-3" />}
      {t('signOut')}
    </button>
  );
}
