'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

// Floating "Demo Mode" indicator. Rendered globally (root layout) so anyone
// evaluating the project instantly understands the data is realistic sample
// data served entirely from within the app, with no backend to configure.
export function DemoBadge() {
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 print:hidden md:left-auto md:right-5 md:translate-x-0">
      <div className="flex items-center gap-2 rounded-full border border-gold/25 bg-gradient-to-br from-onyx-soft to-night px-3.5 py-2 text-cream shadow-[0_10px_30px_-12px_rgba(35,24,16,0.65)] ring-1 ring-gold/10">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium"
          aria-expanded={open}
        >
          <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
          Demo Mode
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss demo badge"
          className="flex h-5 w-5 items-center justify-center rounded-full text-cream/60 transition-colors hover:bg-cream/10 hover:text-cream"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="absolute bottom-full mb-2 w-[min(20rem,calc(100vw-2rem))] rounded-card border border-line bg-paper p-4 text-left shadow-[0_18px_50px_-18px_rgba(35,24,16,0.45)] md:right-0">
          <p className="text-sm font-medium text-ink">You&apos;re exploring an interactive demo</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            Every screen — bookings, clients, calendar and analytics — runs on realistic
            sample data, with no account or setup required. Feel free to click around.
          </p>
        </div>
      )}
    </div>
  );
}
