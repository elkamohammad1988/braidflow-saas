'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  addAvailabilityRuleAction,
  removeAvailabilityRuleAction
} from '@/lib/availability/actions';
import { DAY_LABELS, minutesToTime, timeStringToMinutes } from '@/lib/availability/format';

export type Rule = {
  id: string;
  day_of_week: number;
  start_minute: number;
  end_minute: number;
};

export function WeeklyEditor({ rules }: { rules: Rule[] }) {
  const byDay = new Map<number, Rule[]>();
  rules.forEach((r) => {
    if (!byDay.has(r.day_of_week)) byDay.set(r.day_of_week, []);
    byDay.get(r.day_of_week)!.push(r);
  });

  return (
    <div className="divide-y divide-ink/5">
      {DAY_LABELS.map((label, day) => (
        <DayRow key={day} day={day} label={label} rules={(byDay.get(day) ?? []).sort((a, b) => a.start_minute - b.start_minute)} />
      ))}
    </div>
  );
}

function DayRow({ day, label, rules }: { day: number; label: string; rules: Rule[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-4">
        <p className="w-24 text-sm font-medium text-ink">{label}</p>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {rules.length === 0 && !adding && (
            <span className="text-sm text-ink-muted">Off</span>
          )}
          {rules.map((r) => (
            <RuleChip key={r.id} rule={r} />
          ))}
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-sm font-medium text-ink hover:underline underline-offset-4"
          >
            + Add range
          </button>
        )}
      </div>

      {adding && (
        <AddRangeForm
          day={day}
          onDone={() => setAdding(false)}
        />
      )}
    </div>
  );
}

function RuleChip({ rule }: { rule: Rule }) {
  const [pending, startTransition] = useTransition();
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-3 py-1 text-xs text-ink">
      {minutesToTime(rule.start_minute)} – {minutesToTime(rule.end_minute)}
      <button
        type="button"
        aria-label="Remove range"
        disabled={pending}
        onClick={() => startTransition(() => removeAvailabilityRuleAction(rule.id))}
        className="text-ink-muted hover:text-ink disabled:opacity-50"
      >
        {pending ? <Spinner className="h-3 w-3" /> : '×'}
      </button>
    </span>
  );
}

function AddRangeForm({ day, onDone }: { day: number; onDone: () => void }) {
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    const startMinute = timeStringToMinutes(start);
    const endMinute = timeStringToMinutes(end);
    if (startMinute == null || endMinute == null) {
      setError('Pick a valid time.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await addAvailabilityRuleAction({
        dayOfWeek: day,
        startMinute,
        endMinute
      });
      if (result?.error) setError(result.error);
      else onDone();
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-end gap-3 pl-24">
      <label className="text-xs text-ink-muted">
        From
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="mt-1 block h-10 rounded-lg border border-ink/10 bg-white px-3 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
        />
      </label>
      <label className="text-xs text-ink-muted">
        To
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="mt-1 block h-10 rounded-lg border border-ink/10 bg-white px-3 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
        />
      </label>
      <Button size="sm" onClick={save} disabled={pending}>
        {pending ? <Spinner className="mr-2" /> : null}
        Save
      </Button>
      <button
        type="button"
        onClick={onDone}
        className="text-sm text-ink-muted hover:text-ink"
      >
        Cancel
      </button>
      {error && <p className="basis-full text-sm text-red-600">{error}</p>}
    </div>
  );
}

