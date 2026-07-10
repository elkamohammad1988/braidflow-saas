'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';

type Props = {
  isLoggedIn: boolean;
  isBraider: boolean;
};

export function MobileMenu({ isLoggedIn, isBraider }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const t = useTranslations();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // While open: close on Escape, keep Tab within the panel (it visually covers
  // the page, so focus must not wander behind it), lock body scroll, move focus
  // into the panel, and restore it to the trigger on close.
  useEffect(() => {
    if (!open) return;
    // Captured now so the cleanup restores focus to the same node (the trigger
    // is always mounted, but this satisfies the exhaustive-deps ref rule).
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    // Focus the first control once the panel has mounted.
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      trigger?.focus();
    };
  }, [open]);

  // The whole menu is CSS-hidden at the `md` breakpoint. If the viewport grows
  // past it while the menu is open (desktop resize, tablet rotation, dev tools),
  // the panel and its toggle vanish but `open` stays true — leaving body scroll
  // locked with no visible way to close it. Close on cross so the effect above
  // runs its cleanup and restores scrolling.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const sync = () => {
      if (desktop.matches) setOpen(false);
    };
    sync();
    desktop.addEventListener('change', sync);
    return () => desktop.removeEventListener('change', sync);
  }, []);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="mobile-menu-panel"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-paper text-ink shadow-card"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 top-16 z-40 bg-night/40 backdrop-blur-sm"
            onClick={close}
          />
          <div
            id="mobile-menu-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('common.menu')}
            className="fixed inset-x-3 top-[4.5rem] z-50 rounded-card border border-line bg-paper p-4 shadow-lifted"
          >
            <nav className="flex flex-col">
              <Link
                href="/braiders"
                onClick={close}
                className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-ink/[0.05]"
              >
                {t('nav.findBraider')}
              </Link>
              <Link
                href="/pricing"
                onClick={close}
                className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-ink/[0.05]"
              >
                {t('nav.pricing')}
              </Link>
              {!isLoggedIn && (
                <Link
                  href="/signup?role=braider"
                  onClick={close}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-ink/[0.05]"
                >
                  {t('nav.imBraider')}
                </Link>
              )}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
              {isLoggedIn ? (
                <Link href={isBraider ? '/dashboard' : '/bookings'} onClick={close}>
                  <Button className="w-full">
                    {isBraider ? t('common.dashboard') : t('common.myBookings')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={close}>
                    <Button variant="secondary" className="w-full">
                      {t('common.logIn')}
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={close}>
                    <Button className="w-full">{t('common.getStarted')}</Button>
                  </Link>
                </>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line px-1 pt-3">
              <span className="text-sm font-medium text-ink-muted">{t('common.language')}</span>
              <LanguageSwitcher />
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <span className="text-sm font-medium text-ink-muted">{t('common.theme')}</span>
              <ThemeToggle />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
