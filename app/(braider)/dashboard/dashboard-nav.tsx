'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  Users,
  Scissors,
  Clock,
  Settings,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links: { href: string; key: string; icon: LucideIcon }[] = [
  { href: '/dashboard', key: 'overview', icon: LayoutDashboard },
  { href: '/dashboard/calendar', key: 'calendar', icon: CalendarDays },
  { href: '/dashboard/appointments', key: 'appointments', icon: CalendarCheck },
  { href: '/dashboard/clients', key: 'clients', icon: Users },
  { href: '/dashboard/services', key: 'services', icon: Scissors },
  { href: '/dashboard/availability', key: 'availability', icon: Clock },
  { href: '/dashboard/settings', key: 'settings', icon: Settings }
];

function isActive(pathname: string, href: string) {
  // Overview matches exactly; subsections match the route prefix so
  // /dashboard/services/new still highlights "Services".
  return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
}

/**
 * NavIcon — the nav's crystal chip. The active item's glyph is set into a small
 * frosted tile that reads as a lit gem on the dark active row: an accent glow
 * behind it, a frosted-glass body with a lit top edge, a specular gloss, and the
 * glyph in the accent tint. Inactive items keep a same-footprint (no layout
 * shift) transparent tile that warms on hover. This carries the GlassIcon crystal
 * language from the stat cards into the always-visible nav.
 */
function NavIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      {/* accent glow pooling behind the crystal (active only) */}
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-xl bg-[radial-gradient(circle,rgb(var(--accent-glow)/0.5),transparent_70%)] blur-md"
        />
      )}
      <span
        className={cn(
          'relative flex h-8 w-8 items-center justify-center rounded-[10px] ring-1 transition-all duration-200 ease-spring',
          active
            ? 'bg-gradient-to-b from-white/[0.17] to-white/[0.03] ring-gold/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-7px_12px_-9px_rgba(0,0,0,0.7)]'
            : 'ring-transparent group-hover:bg-ink/[0.06]'
        )}
      >
        {/* specular gloss — light catching the top-left of the glass */}
        {active && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] bg-[radial-gradient(115%_80%_at_28%_-12%,rgba(255,255,255,0.4),transparent_55%)]"
          />
        )}
        <Icon
          className={cn(
            'relative h-[17px] w-[17px] transition-colors',
            active
              ? 'text-clay-soft dark:text-gold [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.45))]'
              : 'text-ink-subtle group-hover:text-ink'
          )}
          strokeWidth={active ? 2 : 1.75}
        />
      </span>
    </span>
  );
}

export function DashboardNav({ orientation = 'vertical' }: { orientation?: 'vertical' | 'horizontal' }) {
  const pathname = usePathname();
  const t = useTranslations('dashboardNav');

  if (orientation === 'horizontal') {
    return (
      <nav className="flex gap-1 overflow-x-auto pb-px [-webkit-mask-image:linear-gradient(to_right,transparent,#000_1.25rem,#000_calc(100%-1.25rem),transparent)] [mask-image:linear-gradient(to_right,transparent,#000_1.25rem,#000_calc(100%-1.25rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map((l) => {
          const active = isActive(pathname, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full py-1 pe-4 ps-1.5 text-sm font-medium transition-all duration-200 ease-spring',
                active
                  ? 'bg-gradient-to-br from-night to-night-deep text-ivory ring-1 ring-gold/20'
                  : 'text-ink-muted hover:bg-ink/[0.05] hover:text-ink'
              )}
            >
              <NavIcon icon={l.icon} active={active} />
              {t(l.key)}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="text-sm">
      <ul className="space-y-1">
        {links.map((l) => {
          const active = isActive(pathname, l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl py-1.5 pe-3 ps-1.5 font-medium transition-all duration-200 ease-spring',
                  active
                    ? 'bg-gradient-to-br from-night to-night-deep text-ivory shadow-[0_8px_22px_-10px_rgba(0,0,0,0.55)] ring-1 ring-gold/15'
                    : 'text-ink-muted hover:bg-ink/[0.05] hover:text-ink'
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute start-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-clay-soft to-clay dark:from-gold-bright dark:to-gold"
                  />
                )}
                <NavIcon icon={l.icon} active={active} />
                {t(l.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
