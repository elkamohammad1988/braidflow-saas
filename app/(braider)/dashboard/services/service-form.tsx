'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { createServiceAction, updateServiceAction } from '@/lib/services/actions';
import { cn } from '@/lib/utils';

type Initial = {
  id?: string;
  name?: string;
  description?: string | null;
  durationMinutes?: number;
  priceCents?: number;
  depositCents?: number;
  isActive?: boolean;
};

function dollarsToCents(input: string) {
  const n = Number(input.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function centsToDollars(cents: number) {
  return (cents / 100).toFixed(2);
}

export function ServiceForm({ initial }: { initial?: Initial }) {
  const editing = Boolean(initial?.id);
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [hours, setHours] = useState(
    initial?.durationMinutes ? Math.floor(initial.durationMinutes / 60) : 4
  );
  const [minutes, setMinutes] = useState(
    initial?.durationMinutes ? initial.durationMinutes % 60 : 0
  );
  const [price, setPrice] = useState(
    initial?.priceCents != null ? centsToDollars(initial.priceCents) : ''
  );
  const [deposit, setDeposit] = useState(
    initial?.depositCents != null ? centsToDollars(initial.depositCents) : ''
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    const payload = {
      name,
      description: description ?? '',
      durationMinutes: hours * 60 + minutes,
      priceCents: dollarsToCents(price),
      depositCents: dollarsToCents(deposit),
      isActive
    };

    startTransition(async () => {
      const result = editing
        ? await updateServiceAction(initial!.id!, payload)
        : await createServiceAction(payload);
      if (result && 'error' in result) setError(result.error);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-5"
    >
      <Input
        name="name"
        label="Service name"
        placeholder="Knotless box braids — medium"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Description</span>
        <textarea
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="What's included, length, what to expect."
          className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
        />
        <span className="mt-1 block text-xs text-ink-muted">Optional. Shown on your booking page.</span>
      </label>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink">Duration</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs text-ink-muted">Hours</span>
            <input
              type="number"
              min={0}
              max={24}
              value={hours}
              onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
              className="mt-1 h-11 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-ink-muted">Minutes</span>
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-1 h-11 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <DollarInput label="Service price" value={price} onChange={setPrice} required />
        <DollarInput
          label="Deposit"
          hint="Charged when the client books."
          value={deposit}
          onChange={setDeposit}
          required
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink/10 bg-white px-4 py-3">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-ink"
        />
        <span className="text-sm">
          <span className="font-medium text-ink">Show on my booking page</span>
          <span className="ml-2 text-ink-muted">Uncheck to hide without deleting.</span>
        </span>
      </label>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Spinner className="mr-2" />
              Saving…
            </>
          ) : editing ? 'Save changes' : 'Add service'}
        </Button>
        <a
          href="/dashboard/services"
          className={cn(
            'inline-flex items-center text-sm font-medium text-ink-muted hover:text-ink',
            pending && 'pointer-events-none opacity-50'
          )}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

function DollarInput({
  label,
  value,
  onChange,
  hint,
  required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder="0.00"
          className="h-11 w-full rounded-lg border border-ink/10 bg-white pl-7 pr-3 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
        />
      </div>
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}
