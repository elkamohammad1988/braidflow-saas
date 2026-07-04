import type { Metadata } from 'next';
import Link from 'next/link';
import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Create your account',
  robots: { index: false, follow: false }
};

type SearchParams = { role?: string };

export default function SignupPage({ searchParams }: { searchParams: SearchParams }) {
  const role = searchParams.role === 'braider' ? 'braider' : 'client';

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">
        {role === 'braider' ? 'Set up your booking page' : 'Create your account'}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {role === 'braider'
          ? "Takes about a minute. You'll add services right after."
          : 'Book your next appointment in a couple of taps.'}
      </p>
      <div className="mt-8">
        <SignupForm defaultRole={role} />
      </div>
      <p className="mt-6 text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-ink hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
