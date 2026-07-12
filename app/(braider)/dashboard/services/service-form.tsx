'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Textarea, fieldSurface } from '@/components/ui/field';
import { ChevronDown } from 'lucide-react';
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
  const t = useTranslations('dashboard');
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
        label={t('services.form.nameLabel')}
        placeholder={t('services.form.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Textarea
        label={t('services.form.descriptionLabel')}
        value={description ?? ''}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder={t('services.form.descriptionPlaceholder')}
        hint={t('services.form.descriptionHint')}
      />

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink">{t('services.form.duration')}</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs text-ink-muted">{t('services.form.hours')}</span>
            <input
              type="number"
              min={0}
              max={24}
              value={hours}
              onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
              className={cn(fieldSurface, 'mt-1 h-10 w-full px-3.5')}
            />
          </label>
          <label className="block">
            <span className="block text-xs text-ink-muted">{t('services.form.minutes')}</span>
            <div className="relative mt-1">
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className={cn(fieldSurface, 'h-10 w-full cursor-pointer appearance-none px-3.5 pe-10')}
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                strokeWidth={2}
                className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
              />
            </div>
          </label>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <DollarInput label={t('services.form.priceLabel')} value={price} onChange={setPrice} required />
        <DollarInput
          label={t('services.form.depositLabel')}
          hint={t('services.form.depositHint')}
          value={deposit}
          onChange={setDeposit}
          required
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line-strong bg-paper px-4 py-3 transition-colors hover:border-clay/30">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-clay"
        />
        <span className="text-sm">
          <span className="font-medium text-ink">{t('services.form.showLabel')}</span>
          <span className="ms-2 text-ink-muted">{t('services.form.showHint')}</span>
        </span>
      </label>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Spinner className="me-2" />
              {t('services.form.saving')}
            </>
          ) : editing ? t('services.form.saveChanges') : t('services.form.create')}
        </Button>
        <a
          href="/dashboard/services"
          className={cn(
            'inline-flex items-center text-sm font-medium text-ink-muted hover:text-ink',
            pending && 'pointer-events-none opacity-50'
          )}
        >
          {t('services.form.cancel')}
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
        <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder="0.00"
          className={cn(fieldSurface, 'h-10 w-full ps-7 pe-3.5')}
        />
      </div>
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}
