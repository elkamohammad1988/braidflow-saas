import Link from 'next/link';
import { TZDate } from '@date-fns/tz';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import {
  ArrowRight,
  CalendarCheck,
  Wallet,
  Hourglass,
  Users,
  CalendarPlus,
  CheckCircle2,
  Info,
  type LucideIcon
} from 'lucide-react';
import { db } from '@/lib/db/server';
import { requireBraider } from '@/lib/auth/session';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { ActivationChecklist } from '@/components/braider/activation-checklist';
import { formatMoney, initials } from '@/lib/utils';
import { formatAppointment, formatInZone } from '@/lib/format-date';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';
import { getTranslations } from 'next-intl/server';

export default async function DashboardOverview({
  searchParams
}: {
  searchParams: { connect?: string };
}) {
  const { user, profile } = await requireBraider();
  const database = db();
  const t = await getTranslations('dashboard');

  const { data: braiderRow } = await database
    .from('braiders')
    .select('timezone, charges_enabled, stripe_onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();
  const tz = braiderRow?.timezone ?? DEFAULT_TIMEZONE;

  // Compute "this week"/"this month" boundaries in the braider's zone so the
  // counts and revenue match their local calendar, not the server's (UTC).
  const now = TZDate.tz(tz);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    upcomingRes,
    monthRevenueRes,
    pendingRes,
    distinctClientsRes,
    serviceCountRes,
    hoursCountRes
  ] = await Promise.all([
    database
      .from('bookings')
      .select(
        'id, scheduled_at, status, price_cents, guest_name, services(name), profiles!bookings_client_id_fkey(full_name)'
      )
      .eq('braider_id', user.id)
      .gte('scheduled_at', startOfDay(now).toISOString())
      .lte('scheduled_at', endOfDay(weekEnd).toISOString())
      .in('status', ['pending_payment', 'confirmed'])
      .order('scheduled_at'),
    database
      .from('bookings')
      .select('price_cents')
      .eq('braider_id', user.id)
      .gte('scheduled_at', monthStart.toISOString())
      .lte('scheduled_at', monthEnd.toISOString())
      .in('status', ['confirmed', 'completed']),
    database
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('braider_id', user.id)
      .eq('status', 'pending_payment'),
    database.from('bookings').select('client_id, guest_email').eq('braider_id', user.id),
    database
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('braider_id', user.id)
      .eq('is_active', true),
    database
      .from('availability_rules')
      .select('id', { count: 'exact', head: true })
      .eq('braider_id', user.id)
  ]);

  const firstError =
    upcomingRes.error || monthRevenueRes.error || pendingRes.error || distinctClientsRes.error;
  if (firstError) throw firstError;

  const upcomingThisWeek = upcomingRes.data ?? [];
  const monthRevenue = (monthRevenueRes.data ?? []).reduce((sum, b) => sum + b.price_cents, 0);
  const pendingCount = pendingRes.count ?? 0;
  // Count distinct people the same way the Clients page groups them: registered
  // clients by account id, guests by email — so this KPI matches that list.
  const clientKeys = new Set<string>();
  (distinctClientsRes.data ?? []).forEach((b) => {
    if (b.client_id) clientKeys.add(b.client_id);
    else if (b.guest_email) clientKeys.add(`guest:${b.guest_email.toLowerCase()}`);
  });
  const totalClients = clientKeys.size;

  // First-run activation: a braider can't take bookings until they have a
  // service, set hours, and Stripe can accept charges. Show a guided checklist
  // until all three are done.
  const hasService = (serviceCountRes.count ?? 0) > 0;
  const hasHours = (hoursCountRes.count ?? 0) > 0;
  const chargesEnabled = braiderRow?.charges_enabled ?? false;
  const onboardingComplete = braiderRow?.stripe_onboarding_complete ?? false;
  const activated = hasService && hasHours && chargesEnabled;

  return (
    <div>
      <PageHeader
        eyebrow={t('overview.eyebrow')}
        title={t('overview.title', { name: profile.full_name.split(' ')[0] || profile.full_name })}
        description={t('overview.description')}
      />

      {searchParams.connect === 'done' && (
        <div className="motion-safe:animate-fade-in mt-6 flex items-start gap-3 rounded-card border border-moss/30 bg-moss/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moss" />
          <p className="text-sm text-ink">
            <span className="font-medium">{t('overview.connectDone.title')}</span>{' '}
            {t('overview.connectDone.body')}
          </p>
        </div>
      )}
      {searchParams.connect === 'pending' && (
        <div className="motion-safe:animate-fade-in mt-6 flex items-start gap-3 rounded-card border border-clay/30 bg-clay/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-clay-text" />
          <p className="text-sm text-ink">
            <span className="font-medium">{t('overview.connectPending.title')}</span>{' '}
            {t('overview.connectPending.body')}
          </p>
        </div>
      )}

      {!activated && (
        <div className="mt-6">
          <ActivationChecklist
            hasService={hasService}
            hasHours={hasHours}
            chargesEnabled={chargesEnabled}
            onboardingComplete={onboardingComplete}
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={CalendarCheck}
          tone="ink"
          label={t('overview.stats.bookedThisWeek')}
          value={upcomingThisWeek.length.toString()}
          hint={`${formatInZone(weekStart, tz, 'MMM d')} – ${formatInZone(weekEnd, tz, 'MMM d')}`}
        />
        <Stat
          icon={Wallet}
          tone="moss"
          label={t('overview.stats.revenueThisMonth')}
          value={formatMoney(monthRevenue)}
          hint={t('overview.stats.revenueHint')}
        />
        <Stat
          icon={Hourglass}
          tone="clay"
          label={t('overview.stats.awaitingDeposit')}
          value={String(pendingCount)}
          hint={t('overview.stats.awaitingDepositHint')}
        />
        <Stat
          icon={Users}
          tone="ink"
          label={t('overview.stats.totalClients')}
          value={String(totalClients)}
          hint={t('overview.stats.totalClientsHint')}
        />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl tracking-tight text-ink">{t('overview.upNext.title')}</h2>
            <p className="text-sm text-ink-muted">{t('overview.upNext.subtitle')}</p>
          </div>
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            {t('overview.upNext.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {upcomingThisWeek.length > 0 ? (
          <Card className="divide-y divide-line overflow-hidden">
            {upcomingThisWeek.slice(0, 5).map((b) => (
              <Link
                key={b.id}
                href="/dashboard/appointments"
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-ink/[0.04] focus-visible:[outline-offset:-2px]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay/12 text-sm font-semibold text-clay-text">
                  {initials(b.profiles?.full_name ?? b.guest_name ?? '') || '—'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">
                    {b.profiles?.full_name ?? b.guest_name}
                  </p>
                  <p className="truncate text-sm text-ink-muted">{b.services?.name}</p>
                </div>
                <div className="hidden text-end sm:block">
                  <p className="text-sm text-ink">{formatAppointment(b.scheduled_at, tz)}</p>
                </div>
                <Badge tone={b.status === 'confirmed' ? 'success' : 'warning'} dot>
                  {b.status === 'confirmed' ? t('status.confirmed') : t('status.deposit')}
                </Badge>
              </Link>
            ))}
          </Card>
        ) : (
          <EmptyState
            icon={CalendarPlus}
            title={t('overview.empty.title')}
            description={t('overview.empty.description')}
            action={
              <Link href="/dashboard/settings">
                <Button variant="secondary" size="sm">
                  {t('overview.empty.action')}
                </Button>
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}

const statTones: Record<'ink' | 'moss' | 'clay', string> = {
  ink: 'bg-ink/[0.06] text-ink ring-1 ring-ink/[0.06]',
  moss: 'bg-moss/10 text-moss ring-1 ring-moss/15',
  clay: 'bg-clay/15 text-clay-text ring-1 ring-clay/20'
};

function Stat({
  icon: Icon,
  tone,
  label,
  value,
  hint
}: {
  icon: LucideIcon;
  tone: 'ink' | 'moss' | 'clay';
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card interactive className="group relative overflow-hidden">
      {/* gold corner glow on hover — the marketing tell, carried into the app */}
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(224,163,63,0.16),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardBody className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {label}
          </p>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${statTones[tone]}`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </span>
        </div>
        <p className="mt-3 font-display text-[2rem] font-medium leading-none tracking-tight tabular-nums text-ink">
          {value}
        </p>
        {hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      </CardBody>
    </Card>
  );
}
