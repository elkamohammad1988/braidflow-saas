import type { Metadata } from 'next';
import Link from 'next/link';
import { requireBraider } from '@/lib/auth/session';
import { ensureBraiderRecord } from '@/lib/braider/ensure';
import { dbAdmin } from '@/lib/db/server';
import { SignOutLink } from '@/components/shared/sign-out';
import { Logo, LogoMark } from '@/components/shared/logo';
import { ConnectBanner } from '@/components/braider/connect-banner';
import { InitialsAvatar } from '@/components/shared/initials-avatar';
import { getTranslations } from 'next-intl/server';
import { DashboardNav } from './dashboard-nav';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';

// The dashboard is private application UI — keep it out of search indexes.
export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireBraider();

  // Self-heal: braiders who predate the onboarding trigger (or whose row never
  // got created) get one on first dashboard load, so their public page and
  // settings work immediately.
  await ensureBraiderRecord(user.id, profile.full_name);

  // Until Stripe can take charges for this braider, clients can't book (enforced
  // server-side in createBookingAction); surface a persistent banner to fix it.
  const { data: connect } = await dbAdmin()
    .from('braiders')
    .select('charges_enabled, stripe_onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();
  const needsConnect = !connect?.charges_enabled;
  const t = await getTranslations();

  const userBlock = (
    <div className="flex items-center gap-3">
      <InitialsAvatar name={profile.full_name} size="sm" fallback="B" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{profile.full_name}</p>
        <p className="text-xs text-ink-muted">{t('dashboardNav.braider')}</p>
      </div>
    </div>
  );

  return (
    // Transparent so the app shell inherits the site-wide ambient key-light
    // (see root layout) — the dashboard reads as lit from above, not flat black.
    <div className="min-h-screen">
      {/* Mobile top bar + scrollable nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-cream/80 backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" aria-label="BraidFlow home">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <InitialsAvatar name={profile.full_name} size="sm" fallback="B" />
            <SignOutLink />
          </div>
        </div>
        <div className="border-t border-line px-4 py-2.5">
          <DashboardNav orientation="horizontal" />
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-line bg-cream-deep/40 px-3.5 py-5 md:flex">
          <Link href="/" aria-label="BraidFlow home" className="px-2 transition-opacity hover:opacity-80">
            <Logo />
          </Link>

          <div className="mt-6 flex-1">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              {t('dashboardNav.workspace')}
            </p>
            <DashboardNav />
          </div>

          <div className="mt-6 rounded-card border border-line bg-paper p-3 shadow-card">
            {userBlock}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
              >
                <LogoMark className="h-3.5 w-3.5" />
                {t('common.viewSite')}
              </Link>
              <SignOutLink className="text-xs" />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="text-xs font-medium text-ink-muted">{t('common.language')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main id="main-content" className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-8">
          <div className="mx-auto max-w-5xl">
            {needsConnect && (
              <ConnectBanner onboardingComplete={connect?.stripe_onboarding_complete ?? false} />
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
