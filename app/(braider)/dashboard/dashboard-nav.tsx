'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarCheck },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/services', label: 'Services', icon: Scissors },
  { href: '/dashboard/availability', label: 'Availability', icon: Clock },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings }
];

function isActive(pathname: string, href: string) {
  // Overview matches exactly; subsections match the route prefix so
  // /dashboard/services/new still highlights "Services".
  return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
}

export function DashboardNav({ orientation = 'vertical' }: { orientation?: 'vertical' | 'horizontal' }) {
  const pathname = usePathname();

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
                'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-ink text-cream'
                  : 'text-ink-muted hover:bg-ink/[0.05] hover:text-ink'
              )}
            >
              <Icon className="h-4 w-4" />
              {l.label}
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
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors',
                  active
                    ? 'bg-ink text-cream shadow-sm'
                    : 'text-ink-muted hover:bg-ink/[0.05] hover:text-ink'
                )}
              >
                <Icon
                  className={cn('h-[18px] w-[18px]', active ? 'text-cream' : 'text-ink-subtle group-hover:text-ink')}
                  strokeWidth={active ? 2 : 1.75}
                />
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
