import Link from 'next/link';
import { requireBraider } from '@/lib/auth/session';
import { ensureBraiderRecord } from '@/lib/braider/ensure';
import { supabaseAdmin } from '@/lib/supabase/server';
import { SignOutLink } from '@/components/shared/sign-out';
import { Logo, LogoMark } from '@/components/shared/logo';
import { ConnectBanner } from '@/components/braider/connect-banner';
import { DashboardNav } from './dashboard-nav';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireBraider();

  // Self-heal: braiders who predate the onboarding trigger (or whose row never
  // got created) get one on first dashboard load, so their public page and
  // settings work immediately.
  await ensureBraiderRecord(user.id, profile.full_name);

  // Until Stripe can take charges for this braider, clients can't book (enforced
  // server-side in createBookingAction); surface a persistent banner to fix it.
  const { data: connect } = await supabaseAdmin()
    .from('braiders')
    .select('charges_enabled, stripe_onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();
  const needsConnect = !connect?.charges_enabled;

  const userBlock = (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay/15 text-sm font-semibold text-clay">
        {initials(profile.full_name) || 'B'}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{profile.full_name}</p>
        <p className="text-xs text-ink-muted">Braider</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Mobile top bar + scrollable nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur-md md:hidden">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" aria-label="BraidFlow home">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-clay/15 text-sm font-semibold text-clay">
              {initials(profile.full_name) || 'B'}
            </span>
            <SignOutLink />
          </div>
        </div>
        <div className="border-t border-line px-4 py-2.5">
          <DashboardNav orientation="horizontal" />
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-cream-deep/40 px-4 py-6 md:flex">
          <Link href="/" aria-label="BraidFlow home" className="px-2 transition-opacity hover:opacity-80">
            <Logo />
          </Link>

          <div className="mt-8 flex-1">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              Workspace
            </p>
            <DashboardNav />
          </div>

          <div className="mt-6 rounded-card border border-line bg-paper p-3 shadow-card">
            {userBlock}
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink"
              >
                <LogoMark className="h-3.5 w-3.5" />
                View site
              </Link>
              <SignOutLink />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-12">
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
