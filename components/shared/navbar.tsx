import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { SignOutLink } from './sign-out';
import { MobileMenu } from './mobile-menu';

export async function Navbar() {
  const session = await getSession();
  const isBraider = session?.profile.role === 'braider';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium text-ink-muted md:flex">
          <Link href="/braiders" className="rounded-full px-3 py-2 transition-colors hover:bg-ink/[0.05] hover:text-ink">
            Find a braider
          </Link>
          <Link href="/pricing" className="rounded-full px-3 py-2 transition-colors hover:bg-ink/[0.05] hover:text-ink">
            Pricing
          </Link>
          {!session && (
            <Link href="/signup?role=braider" className="rounded-full px-3 py-2 transition-colors hover:bg-ink/[0.05] hover:text-ink">
              For braiders
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href={isBraider ? '/dashboard' : '/bookings'} className="hidden md:inline-flex">
                <Button variant="secondary" size="sm">
                  {isBraider ? 'Dashboard' : 'My bookings'}
                </Button>
              </Link>
              <SignOutLink className="hidden md:inline-flex" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-ink-muted hover:text-ink md:block"
              >
                Log in
              </Link>
              <Link href="/signup" className="hidden md:inline-flex">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
          <MobileMenu isLoggedIn={Boolean(session)} isBraider={isBraider} />
        </div>
      </div>
    </header>
  );
}
