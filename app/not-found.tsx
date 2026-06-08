import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="font-display text-6xl text-clay md:text-7xl">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink md:text-4xl">
        That page slipped through the braid.
      </h1>
      <p className="mt-3 max-w-md text-ink-muted">
        The link might be old, or the page never existed. Either way — we&apos;ll get you back on
        track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button size="lg">Back to home</Button>
        </Link>
        <Link
          href="/braiders"
          className="text-sm font-medium text-ink hover:underline underline-offset-4"
        >
          Or browse braiders →
        </Link>
      </div>
    </div>
  );
}
