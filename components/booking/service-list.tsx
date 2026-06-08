'use client';

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
  return (
    <ul className="space-y-2">
      {services.map((s) => {
        const active = s.id === selectedId;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                'w-full rounded-card border bg-white px-5 py-4 text-left transition-colors',
                active ? 'border-ink' : 'border-ink/10 hover:border-ink/25'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">{s.name}</p>
                  {s.description && (
                    <p className="mt-1 text-sm text-ink-muted">{s.description}</p>
                  )}
                  <p className="mt-2 text-xs text-ink-muted">
                    {formatDuration(s.duration_minutes)} · deposit {formatMoney(s.deposit_cents)}
                  </p>
                </div>
                <p className="shrink-0 font-display text-lg text-ink">
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
