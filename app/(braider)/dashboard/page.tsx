import Link from 'next/link';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
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
  type LucideIcon
} from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import { requireBraider } from '@/lib/auth/session';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/utils';
import { formatAppointment } from '@/lib/format-date';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function DashboardOverview() {
  const { user, profile } = await requireBraider();
  const supabase = supabaseServer();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    upcomingRes,
    monthRevenueRes,
    pendingRes,
    distinctClientsRes
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select(
        'id, scheduled_at, status, price_cents, services(name), profiles!bookings_client_id_fkey(full_name)'
      )
      .eq('braider_id', user.id)
      .gte('scheduled_at', startOfDay(now).toISOString())
      .lte('scheduled_at', endOfDay(weekEnd).toISOString())
      .in('status', ['pending_payment', 'confirmed'])
      .order('scheduled_at'),
    supabase
      .from('bookings')
      .select('price_cents')
      .eq('braider_id', user.id)
      .gte('scheduled_at', monthStart.toISOString())
      .lte('scheduled_at', monthEnd.toISOString())
      .in('status', ['confirmed', 'completed']),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('braider_id', user.id)
      .eq('status', 'pending_payment'),
    supabase.from('bookings').select('client_id').eq('braider_id', user.id)
  ]);

  const upcomingThisWeek = upcomingRes.data ?? [];
  const monthRevenue = (monthRevenueRes.data ?? []).reduce((sum, b) => sum + b.price_cents, 0);
  const pendingCount = pendingRes.count ?? 0;
  const totalClients = new Set((distinctClientsRes.data ?? []).map((b) => b.client_id)).size;

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title={`Hi, ${profile.full_name.split(' ')[0]}`}
        description="Here's how the week is shaping up."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={CalendarCheck}
          tone="ink"
          label="Booked this week"
          value={upcomingThisWeek.length.toString()}
          hint={`${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`}
        />
        <Stat
          icon={Wallet}
          tone="moss"
          label="Revenue this month"
          value={formatMoney(monthRevenue)}
          hint="Confirmed + completed"
        />
        <Stat
          icon={Hourglass}
          tone="clay"
          label="Awaiting deposit"
          value={String(pendingCount)}
          hint="Holds not yet collected"
        />
        <Stat
          icon={Users}
          tone="ink"
          label="Total clients"
          value={String(totalClients)}
          hint="Lifetime, unique"
        />
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl tracking-tight text-ink">Up next</h2>
            <p className="text-sm text-ink-muted">Your next five appointments.</p>
          </div>
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            All appointments
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {upcomingThisWeek.length > 0 ? (
          <Card className="divide-y divide-line overflow-hidden">
            {upcomingThisWeek.slice(0, 5).map((b) => (
              <Link
                key={b.id}
                href="/dashboard/appointments"
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream/50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay/12 text-sm font-semibold text-clay">
                  {initials(b.profiles?.full_name ?? '') || '—'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{b.profiles?.full_name}</p>
                  <p className="truncate text-sm text-ink-muted">{b.services?.name}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm text-ink">{formatAppointment(new Date(b.scheduled_at))}</p>
                </div>
                <Badge tone={b.status === 'confirmed' ? 'success' : 'warning'} dot>
                  {b.status === 'confirmed' ? 'Confirmed' : 'Deposit'}
                </Badge>
              </Link>
            ))}
          </Card>
        ) : (
          <EmptyState
            icon={CalendarPlus}
            title="Nothing on the books for this week"
            description="Share your booking page and we'll fill this up."
            action={
              <Link href="/dashboard/settings">
                <Button variant="secondary" size="sm">
                  Copy your link
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
  ink: 'bg-ink/[0.06] text-ink',
  moss: 'bg-moss/10 text-moss',
  clay: 'bg-clay/15 text-clay'
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
    <Card interactive>
      <CardBody>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</p>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${statTones[tone]}`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.9} />
          </span>
        </div>
        <p className="mt-3 font-display text-3xl tracking-tight text-ink">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      </CardBody>
    </Card>
  );
}
