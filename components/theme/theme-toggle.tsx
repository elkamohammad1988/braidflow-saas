'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Light ⇄ dark switch. The icon and accessible name are driven purely by the
 * `.dark` class via `dark:` variants (not React state), so the control renders
 * identically on the server and client — no hydration mismatch and no flash. The
 * click handler reads the live DOM state, flips it, and persists the choice; the
 * blocking ThemeScript restores it before paint on the next load.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations('common.theme');

  function toggle() {
    const el = document.documentElement;
    const isDark = el.classList.toggle('dark');
    el.style.colorScheme = isDark ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {
      // storage blocked (private mode) — the choice just won't persist
    }
    // Keep the browser chrome (address bar / status bar tint) in sync.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#07030F' : '#FAF7FF');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-clay-text shadow-card transition-colors',
        'hover:border-clay/40 hover:text-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/45',
        className
      )}
    >
      {/* Sun shows in dark mode (tap to go light); Moon in light mode. Both are
          in the DOM; CSS reveals one so the accessible name follows the theme. */}
      <Sun aria-hidden className="hidden h-[18px] w-[18px] dark:block" strokeWidth={1.9} />
      <Moon aria-hidden className="h-[18px] w-[18px] dark:hidden" strokeWidth={1.9} />
      <span className="sr-only dark:hidden">{t('switchToDark')}</span>
      <span className="sr-only hidden dark:block">{t('switchToLight')}</span>
    </button>
  );
}
