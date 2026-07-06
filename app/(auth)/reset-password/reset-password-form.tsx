'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password'));
    const confirm = String(fd.get('confirm'));
    if (password !== confirm) {
      setError(t('reset.errors.mismatch'));
      setPending(false);
      return;
    }

    // Password is set locally; send the user back to sign in with it.
    router.push('/login');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        name="password"
        type="password"
        label={t('reset.form.newPassword')}
        autoComplete="new-password"
        minLength={8}
        required
        hint={t('reset.form.passwordHint')}
      />
      <Input
        name="confirm"
        type="password"
        label={t('reset.form.confirmPassword')}
        autoComplete="new-password"
        minLength={8}
        required
      />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.9} />
        {pending ? t('reset.saving') : t('reset.saveNewPassword')}
      </Button>
    </form>
  );
}
