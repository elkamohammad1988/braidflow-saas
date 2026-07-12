'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { TZDate } from '@date-fns/tz';
import { Button } from '@/components/ui/button';
import { fieldSurface } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { addOverrideAction, removeOverrideAction } from '@/lib/availability/actions';
import { formatInZone } from '@/lib/format-date';
import { cn } from '@/lib/utils';

export type Override = {
  id: string;
  starts_at: string;
  ends_at: string;
  note: string | null;
};

export function OverridesEditor({
  overrides,
  timeZone
}: {
  overrides: Override[];
  timeZone: string;
}) {
  const t = useTranslations('dashboard');
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">{t('availability.timeOff')}</h2>
        {!adding && (
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
            {t('availability.addBlock')}
          </Button>
        )}
      </div>
      <p className="mb-4 text-sm text-ink-muted">
        {t('availability.timeOffDescription')}
      </p>

      {adding && <AddOverrideForm timeZone={timeZone} onDone={() => setAdding(false)} />}

      <ul className="mt-4 space-y-2">
        {overrides.length === 0 && !adding && (
          <li className="rounded-card border border-dashed border-line-strong bg-cream/40 px-4 py-6 text-center text-sm text-ink-muted">
            {t('availability.nothingBlocked')}
          </li>
        )}
        {overrides.map((o) => (
          <OverrideRow key={o.id} override={o} timeZone={timeZone} />
        ))}
      </ul>
    </div>
  );
}

function OverrideRow({ override, timeZone }: { override: Override; timeZone: string }) {
  const t = useTranslations('dashboard');
  const [pending, startTransition] = useTransition();
  // Format in the braider's zone so server and client render identical text
  // (raw date-fns `format` uses the runtime zone → hydration mismatch).
  const sameDay =
    formatInZone(override.starts_at, timeZone, 'yyyy-MM-dd') ===
    formatInZone(override.ends_at, timeZone, 'yyyy-MM-dd');
  const label = sameDay
    ? `${formatInZone(override.starts_at, timeZone, 'EEE, MMM d')} · ${formatInZone(
        override.starts_at,
        timeZone,
        'h:mm a'
      )} – ${formatInZone(override.ends_at, timeZone, 'h:mm a')}`
    : `${formatInZone(override.starts_at, timeZone, 'MMM d, h:mm a')} – ${formatInZone(
        override.ends_at,
        timeZone,
        'MMM d, h:mm a'
      )}`;

  return (
    <li className="flex items-center justify-between gap-4 rounded-card border border-line bg-paper px-5 py-3 shadow-card">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {override.note && (
          <p className="mt-0.5 break-words text-xs text-ink-muted">{override.note}</p>
        )}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => removeOverrideAction(override.id))}
        className="shrink-0 text-sm text-ink-muted hover:text-ink disabled:opacity-50"
      >
        {pending ? <Spinner /> : t('availability.remove')}
      </button>
    </li>
  );
}

// Build an absolute instant from a wall-clock `yyyy-MM-dd` + `HH:mm` interpreted
// in the braider's business timezone (NOT the browser's). Overrides are stored
// as UTC instants and re-read by computeSlotsForDay in the same zone, so parsing
// with a bare `new Date('…')` (which uses the runtime zone) would block the wrong
// hours whenever the braider's device zone differs from their studio's.
function zonedInstant(dateStr: string, timeStr: string, timeZone: string): Date | null {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, mi] = timeStr.split(':').map(Number);
  if ([y, mo, d, h, mi].some((n) => n === undefined || Number.isNaN(n))) return null;
  const zoned = new TZDate(y!, mo! - 1, d!, h!, mi!, 0, 0, timeZone);
  const ms = zoned.getTime();
  return Number.isNaN(ms) ? null : new Date(ms);
}

function AddOverrideForm({ timeZone, onDone }: { timeZone: string; onDone: () => void }) {
  const t = useTranslations('dashboard');
  // "Today" in the braider's zone, so the date picker's min/default match the
  // zone the block is actually stored and displayed in.
  const today = formatInZone(new Date(), timeZone, 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const firstRef = useRef<HTMLInputElement>(null);

  // Opening the form unmounts the "Add block" trigger, so move focus into the
  // form instead of letting it fall back to <body>.
  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  function save() {
    setError(null);
    const startsAt = zonedInstant(date, startTime, timeZone);
    const endsAt = zonedInstant(date, endTime, timeZone);

    if (!startsAt || !endsAt) {
      setError(t('availability.invalidDateTime'));
      return;
    }

    startTransition(async () => {
      const result = await addOverrideAction({
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        note: note || undefined
      });
      if (result?.error) setError(result.error);
      else onDone();
    });
  }

  return (
    <div className="rounded-card border border-line bg-paper p-5 shadow-card">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-ink-muted">
          {t('availability.date')}
          <input
            ref={firstRef}
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className={cn(fieldSurface, 'mt-1 block h-10 w-full px-3.5')}
          />
        </label>
        <label className="text-xs text-ink-muted">
          {t('availability.from')}
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={cn(fieldSurface, 'mt-1 block h-10 w-full px-3.5')}
          />
        </label>
        <label className="text-xs text-ink-muted">
          {t('availability.to')}
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={cn(fieldSurface, 'mt-1 block h-10 w-full px-3.5')}
          />
        </label>
      </div>

      <label className="mt-3 block text-xs text-ink-muted">
        {t('availability.noteOptional')}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={120}
          placeholder={t('availability.notePlaceholder')}
          className={cn(fieldSurface, 'mt-1 block h-10 w-full px-3.5')}
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <Button size="sm" onClick={save} disabled={pending}>
          {pending && <Spinner className="me-2" />}
          {t('availability.saveBlock')}
        </Button>
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-ink-muted hover:text-ink"
        >
          {t('availability.cancel')}
        </button>
      </div>
    </div>
  );
}
