'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn, formatDuration, formatMoney } from '@/lib/utils';

export type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  deposit_cents: number;
};

type Props = {
  services: Service[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

export function ServiceList({ services, selectedId, onSelect }: Props) {
  const t = useTranslations('booking');
  return (
    <ul className="space-y-2.5">
      {services.map((s) => {
        const active = s.id === selectedId;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              aria-pressed={active}
              className={cn(
                'group w-full rounded-card border px-5 py-4 text-start transition-all duration-300 ease-spring active:scale-[0.99]',
                active
                  ? 'border-clay/40 bg-gold/[0.05] shadow-card ring-1 ring-gold/20'
                  : 'border-line bg-paper hover:-translate-y-0.5 hover:border-clay/30 hover:shadow-card'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                        active
                          ? 'border-transparent bg-gradient-to-b from-gold-bright to-gold text-night shadow-glow-gold'
                          : 'border-line-strong group-hover:border-clay/50'
                      )}
                    >
                      {active && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <p className="font-medium text-ink">{s.name}</p>
                  </div>
                  {s.description && (
                    <p className="mt-1.5 ps-6 text-sm leading-relaxed text-ink-muted">
                      {s.description}
                    </p>
                  )}
                  <p className="mt-2 ps-6 text-xs text-ink-subtle">
                    {t('durationDeposit', {
                      duration: formatDuration(s.duration_minutes),
                      deposit: formatMoney(s.deposit_cents)
                    })}
                  </p>
                </div>
                <p className="shrink-0 font-display text-lg tabular-nums text-ink">
                  {formatMoney(s.price_cents)}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
