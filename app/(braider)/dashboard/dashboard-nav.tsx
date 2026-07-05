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

export function DashboardNav({ orientation = 'vertical' }: { orientation?: 'vertical' | 'horizontal' }) {
  const pathname = usePathname();
  const t = useTranslations('dashboardNav');

  if (orientation === 'horizontal') {
    return (
      <nav className="flex gap-1 overflow-x-auto pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map((l) => {
          const active = isActive(pathname, l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-spring',
                active
                  ? 'bg-gradient-to-br from-onyx-soft to-night text-ivory ring-1 ring-gold/20'
                  : 'text-ink-muted hover:bg-ink/[0.05] hover:text-ink'
              )}
            >
              <Icon className={cn('h-4 w-4', active && 'text-gold')} />
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
          const Icon = l.icon;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all duration-200 ease-spring',
                  active
                    ? 'bg-gradient-to-br from-onyx-soft to-night text-ivory shadow-[0_8px_22px_-10px_rgba(35,24,16,0.55)] ring-1 ring-gold/15'
                    : 'text-ink-muted hover:bg-ink/[0.05] hover:text-ink'
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-gold-bright to-gold"
                  />
                )}
                <Icon
                  className={cn('h-[18px] w-[18px]', active ? 'text-gold' : 'text-ink-subtle group-hover:text-ink')}
                  strokeWidth={active ? 2 : 1.75}
                />
                {t(l.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
