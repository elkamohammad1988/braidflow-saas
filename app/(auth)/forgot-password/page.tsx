import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = { title: 'Reset your password' };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Enter the email on your account and we&apos;ll send you a link to set a new password.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-sm text-ink-muted">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-ink hover:underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
