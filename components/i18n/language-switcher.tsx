'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, ChevronDown } from 'lucide-react';
import { locales, localeNames } from '@/i18n/config';
import { setLocale } from '@/i18n/actions';
import { cn } from '@/lib/utils';

// Language picker — a compact, accessible native select (works in RTL, no
// custom popup to trap focus). Persists the choice via the cookie action, then
// refreshes so the whole tree re-renders in the new locale.
export function LanguageSwitcher({ className }: { className?: string }) {
  const active = useLocale();
  const router = useRouter();
  const t = useTranslations('common');
  const [pending, startTransition] = useTransition();

  return (
    <label className={cn('relative inline-flex items-center', className)}>
      <span className="sr-only">{t('language')}</span>
      <Globe
        aria-hidden
        className="pointer-events-none absolute start-2.5 h-4 w-4 text-ink-muted"
        strokeWidth={1.9}
      />
      <select
        value={active}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            await setLocale(next);
            router.refresh();
          });
        }}
        className={cn(
          'cursor-pointer appearance-none rounded-full border border-line bg-paper py-1.5 pe-7 ps-8 text-sm font-medium text-ink shadow-card transition-colors',
          'hover:border-clay/30 focus-visible:border-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/50',
          'disabled:cursor-wait disabled:opacity-60'
        )}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {localeNames[l]}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        strokeWidth={2}
        className="pointer-events-none absolute end-2.5 h-4 w-4 text-ink-subtle"
      />
    </label>
  );
}
