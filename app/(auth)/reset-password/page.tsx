import type { Metadata } from 'next';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = { title: 'Set a new password' };

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Set a new password</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Choose a strong password you don&apos;t use anywhere else.
      </p>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
