import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { getTranslations } from 'next-intl/server';
import { SignOutLink } from './sign-out';
import { MobileMenu } from './mobile-menu';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export async function Navbar() {
  const session = await getSession();
  const isBraider = session?.profile.role === 'braider';
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/70 backdrop-blur-xl backdrop-saturate-150">
      {/* Three tracks — logo | centered nav | controls — so the nav is truly
          centered yet can never overlap the right cluster the way an absolutely
          positioned nav did once the labels got long (e.g. French). */}
      <div className="mx-auto grid h-[60px] max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-6">
        <Link href="/" className="justify-self-start transition-opacity hover:opacity-80">
          <Logo />
        </Link>

        <nav className="hidden items-center justify-self-center gap-0.5 text-sm font-medium text-ink-muted lg:flex">
          {[
            { href: '/braiders', label: t('nav.findBraider') },
            { href: '/pricing', label: t('nav.pricing') },
            ...(!session ? [{ href: '/signup?role=braider', label: t('nav.forBraiders') }] : [])
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative whitespace-nowrap rounded-full px-2.5 py-2 transition-colors hover:text-ink"
            >
              <span
                aria-hidden
                className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-clay to-transparent transition-transform duration-300 ease-spring group-hover:scale-x-100 rtl:origin-right"
              />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-3">
          <ThemeToggle className="hidden lg:inline-flex" />
          <LanguageSwitcher className="hidden lg:inline-flex" />
          {session ? (
            <>
              <Link href={isBraider ? '/dashboard' : '/bookings'} className="hidden lg:inline-flex">
                <Button variant="secondary" size="sm">
                  {isBraider ? t('common.dashboard') : t('common.myBookings')}
                </Button>
              </Link>
              <SignOutLink className="hidden lg:inline-flex" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden whitespace-nowrap text-sm font-medium text-ink-muted transition-colors hover:text-ink lg:block"
              >
                {t('common.logIn')}
              </Link>
              <Link href="/signup" className="hidden lg:inline-flex">
                <Button size="sm">{t('common.getStarted')}</Button>
              </Link>
            </>
          )}
          <MobileMenu isLoggedIn={Boolean(session)} isBraider={isBraider} />
        </div>
      </div>
    </header>
  );
}
