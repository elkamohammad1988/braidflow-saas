'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, X } from 'lucide-react';

// Floating "Demo Mode" indicator. Rendered globally (root layout) so anyone
// evaluating the project instantly understands the data is realistic sample
// data served entirely from within the app, with no backend to configure.
export function DemoBadge() {
  const t = useTranslations('common');
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  if (dismissed) return null;

  return (
    // z-30 sits above page content but BELOW the booking route's mobile sticky
    // action bar (z-40), so the deposit + Continue CTA is never covered there; on
    // every other page (no bottom bar) the badge shows normally.
    <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 print:hidden md:left-auto md:end-5 md:translate-x-0">
      <div className="flex items-center gap-2 rounded-full border border-gold/25 bg-gradient-to-br from-night to-night-deep px-3.5 py-2 text-ivory shadow-[0_10px_30px_-12px_rgba(0,0,0,0.65)] ring-1 ring-gold/10">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium"
          aria-expanded={open}
          aria-controls="demo-badge-info"
        >
          <Sparkles className="h-4 w-4 text-clay-soft dark:text-clay" strokeWidth={2} />
          {t('demoBadge.label')}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t('demoBadge.dismiss')}
          className="flex h-5 w-5 items-center justify-center rounded-full text-ivory/60 transition-colors hover:bg-ivory/10 hover:text-ivory"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div
          id="demo-badge-info"
          // On mobile the badge is viewport-centred, so centre the popover on the
          // same point (the width is capped to the viewport, so it always fits);
          // on desktop the badge is right-anchored, so pin the popover to end-0.
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[min(20rem,calc(100vw-2rem))] rounded-card border border-line bg-paper p-4 text-start shadow-lifted md:left-auto md:translate-x-0 md:end-0"
        >
          <p className="text-sm font-medium text-ink">{t('demoBadge.title')}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {t('demoBadge.description')}
          </p>
        </div>
      )}
    </div>
  );
}
