'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', icon: Sun, key: 'light' },
  { value: 'system', icon: Monitor, key: 'system' },
  { value: 'dark', icon: Moon, key: 'dark' }
] as const;

// Segmented Light / System / Dark control. Renders inert until mounted so the
// server and first client render match (no hydration mismatch); the active
// state fills in after mount.
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('theme');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    // A toggle-button group (not a radiogroup): every option is a tab stop with
    // an honest `aria-pressed` state, matching the signup role toggle. A true
    // radiogroup would promise roving tabindex + arrow-key selection we don't
    // implement, so its ARIA contract would be broken.
    <div
      role="group"
      aria-label={t('label')}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border border-line bg-paper p-0.5 shadow-card',
        className
      )}
    >
      {OPTIONS.map(({ value, icon: Icon, key }) => {
        const active = mounted && theme === value;
        const label = t(key);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              // 28px visual, but a 40px pointer target via hit-slop so it clears
              // the touch-target minimum in the mobile menu without changing the pill.
              'relative flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200',
              'before:absolute before:-inset-1.5 before:content-[""]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/50',
              active
                ? 'bg-ink text-cream shadow-sm'
                : 'text-ink-subtle hover:bg-ink/[0.05] hover:text-ink'
            )}
          >
            <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
