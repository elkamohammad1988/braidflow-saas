'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { addOverrideAction, removeOverrideAction } from '@/lib/availability/actions';

export type Override = {
  id: string;
  starts_at: string;
  ends_at: string;
  note: string | null;
};

export function OverridesEditor({ overrides }: { overrides: Override[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">Time off</h2>
        {!adding && (
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
            Add block
          </Button>
        )}
      </div>
      <p className="mb-4 text-sm text-ink-muted">
        Going on vacation or stepping out for an afternoon? Block it off here so no one books it.
      </p>

      {adding && <AddOverrideForm onDone={() => setAdding(false)} />}

      <ul className="mt-4 space-y-2">
        {overrides.length === 0 && !adding && (
          <li className="rounded-card border border-dashed border-ink/10 bg-white/40 px-4 py-6 text-center text-sm text-ink-muted">
            Nothing blocked off right now.
          </li>
        )}
        {overrides.map((o) => (
          <OverrideRow key={o.id} override={o} />
        ))}
      </ul>
    </div>
  );
}

function OverrideRow({ override }: { override: Override }) {
  const [pending, startTransition] = useTransition();
  const start = new Date(override.starts_at);
  const end = new Date(override.ends_at);
  const sameDay = start.toDateString() === end.toDateString();

  return (
    <li className="flex items-center justify-between gap-4 rounded-card border border-ink/5 bg-white px-5 py-3">
      <div>
        <p className="text-sm font-medium text-ink">
          {sameDay
            ? `${format(start, 'EEE, MMM d')} · ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`
            : `${format(start, 'MMM d, h:mm a')} – ${format(end, 'MMM d, h:mm a')}`}
        </p>
        {override.note && <p className="mt-0.5 text-xs text-ink-muted">{override.note}</p>}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => removeOverrideAction(override.id))}
        className="text-sm text-ink-muted hover:text-ink disabled:opacity-50"
      >
        {pending ? <Spinner /> : 'Remove'}
      </button>
    </li>
  );
}

function AddOverrideForm({ onDone }: { onDone: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    const startsAt = new Date(`${date}T${startTime}:00`);
    const endsAt = new Date(`${date}T${endTime}:00`);

    if (Number.isNaN(+startsAt) || Number.isNaN(+endsAt)) {
      setError('Pick a valid date and time.');
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
    <div className="rounded-card border border-ink/10 bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-ink-muted">
          Date
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </label>
        <label className="text-xs text-ink-muted">
          From
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </label>
        <label className="text-xs text-ink-muted">
          To
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </label>
      </div>

      <label className="mt-3 block text-xs text-ink-muted">
        Note (optional)
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={120}
          placeholder="Birthday, family event, traveling…"
          className="mt-1 block h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-3">
        <Button size="sm" onClick={save} disabled={pending}>
          {pending && <Spinner className="mr-2" />}
          Save block
        </Button>
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
