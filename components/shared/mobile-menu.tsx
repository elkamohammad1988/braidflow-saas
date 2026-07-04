'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  isLoggedIn: boolean;
  isBraider: boolean;
};

export function MobileMenu({ isLoggedIn, isBraider }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Close on Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-paper text-ink shadow-card"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 top-16 z-40 bg-ink/20 backdrop-blur-sm"
            onClick={close}
          />
          <div
            id="mobile-menu-panel"
            className="fixed inset-x-3 top-[4.5rem] z-50 rounded-card border border-line bg-paper p-4 shadow-lifted"
          >
            <nav className="flex flex-col">
              <Link
                href="/braiders"
                onClick={close}
                className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-cream"
              >
                Find a braider
              </Link>
              <Link
                href="/pricing"
                onClick={close}
                className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-cream"
              >
                Pricing
              </Link>
              {!isLoggedIn && (
                <Link
                  href="/signup?role=braider"
                  onClick={close}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-cream"
                >
                  I&apos;m a braider
                </Link>
              )}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
              {isLoggedIn ? (
                <Link href={isBraider ? '/dashboard' : '/bookings'} onClick={close}>
                  <Button className="w-full">{isBraider ? 'Dashboard' : 'My bookings'}</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={close}>
                    <Button variant="secondary" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={close}>
                    <Button className="w-full">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
