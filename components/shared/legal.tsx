import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

// Shared shell for the static legal pages (Privacy, Terms) so they render with
// one consistent typographic treatment. Links inside the body inherit the violet
// underline style via the arbitrary-variant selectors below.
export function LegalShell({
  title,
  updated,
  intro,
  children
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  const t = useTranslations('legal');
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
        {t('shell.label')}
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('shell.lastUpdated', { updated })}</p>
      <p className="mt-6 text-[15px] leading-relaxed text-ink-muted">{intro}</p>
      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-ink-muted [&_a]:font-medium [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_li]:ms-1 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:ps-5">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      {children}
    </section>
  );
}
