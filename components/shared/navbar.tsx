import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { SignOutLink } from './sign-out';
import { MobileMenu } from './mobile-menu';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export async function Navbar() {
  const session = await getSession();
  const isBraider = session?.profile.role === 'braider';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 text-sm font-medium text-ink-muted md:flex">
          {[
            { href: '/braiders', label: 'Find a braider' },
            { href: '/pricing', label: 'Pricing' },
            ...(!session ? [{ href: '/signup?role=braider', label: 'For braiders' }] : [])
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative rounded-full px-3.5 py-2 transition-colors hover:text-ink"
            >
              <span
                aria-hidden
                className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-clay to-transparent transition-transform duration-300 ease-spring group-hover:scale-x-100"
              />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden md:inline-flex" />
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
                className="hidden text-sm font-medium text-ink-muted transition-colors hover:text-ink md:block"
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
