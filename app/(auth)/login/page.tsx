import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false }
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-muted">Sign in to manage your bookings.</p>
      <div className="mt-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-ink-muted">
        New here?{' '}
        <Link href="/signup" className="font-medium text-ink hover:underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
