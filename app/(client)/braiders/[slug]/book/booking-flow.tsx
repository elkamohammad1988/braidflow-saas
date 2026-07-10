'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Lock, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ServiceList, type Service } from '@/components/booking/service-list';
import { SlotPicker } from '@/components/booking/slot-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createBookingAction } from '@/lib/bookings/create';
import { CANCELLATION_REFUND_WINDOW_HOURS } from '@/lib/constants';
import { fieldSurface } from '@/components/ui/field';
import { cn, formatMoney } from '@/lib/utils';
import { formatInZone, zoneAbbreviation } from '@/lib/format-date';

type SerializedDay = {
  date: string;
  slots: { start: string; end: string }[];
};

type Props = {
  services: Service[];
  slotsByService: Record<string, SerializedDay[]>;
  braiderSlug: string;
  businessName: string;
  timeZone: string;
  // When false, the booker isn't signed in and we collect guest contact details
  // inline — no account required to book.
  isAuthenticated: boolean;
};

// Mirrors the server-side zod check; just enough to keep the button honest.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StepHeader({ n, label, done }: { n: number; label: string; done: boolean }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
          done ? 'bg-moss text-cream' : 'bg-ink/[0.06] text-ink-subtle'
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
      </span>
      <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-ink-muted">{label}</h2>
    </div>
  );
}

export function BookingFlow({
  services,
  slotsByService,
  braiderSlug,
  businessName,
  timeZone,
  isAuthenticated
}: Props) {
  const t = useTranslations('booking');
  const [serviceId, setServiceId] = useState<string | undefined>(services[0]?.id);
  const [selectedSlot, setSelectedSlot] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedService = services.find((s) => s.id === serviceId);
  const days = serviceId ? slotsByService[serviceId] ?? [] : [];

  const detailsDone =
    isAuthenticated || (guestName.trim().length > 0 && EMAIL_RE.test(guestEmail.trim()));
  const ready = Boolean(serviceId && selectedSlot && detailsDone);

  function onSelectService(id: string) {
    setServiceId(id);
    setSelectedSlot(undefined);
  }

  function submit() {
    if (!ready || !serviceId || !selectedSlot) return;
    setError(null);
    startTransition(async () => {
      const result = await createBookingAction({
        serviceId,
        scheduledAt: selectedSlot.toISOString(),
        clientNotes: notes || undefined,
        guest: isAuthenticated
          ? undefined
          : {
              name: guestName.trim(),
              email: guestEmail.trim(),
              phone: guestPhone.trim() || undefined
            }
      });
      if (result && 'error' in result) setError(result.error);
    });
  }

  const hydratedDays = days.map((d) => ({
    date: new Date(d.date),
    slots: d.slots.map((s) => ({ start: new Date(s.start), end: new Date(s.end) }))
  }));

  const whenLabel = selectedSlot
    ? `${formatInZone(selectedSlot, timeZone, 'EEE, MMM d · h:mm a')} ${zoneAbbreviation(
        selectedSlot,
        timeZone
      )}`
    : null;

  // Step numbering shifts when there's no guest-details step (signed-in clients).
  const detailsStep = 3;

  return (
    <>
      <div className="grid gap-8 pb-28 md:grid-cols-[minmax(0,1fr)_340px] md:pb-0">
        <div className="min-w-0 space-y-8">
          <section>
            <StepHeader n={1} label={t('stepService')} done={Boolean(serviceId)} />
            <ServiceList services={services} selectedId={serviceId} onSelect={onSelectService} />
          </section>

          <section>
            <StepHeader n={2} label={t('stepTime')} done={Boolean(selectedSlot)} />
            <SlotPicker
              // Remount per service so the picker re-defaults to that service's
              // first open day. Without a stable identity React preserves the
              // previous service's active day, which may have no slots for the new
              // one — showing a false "no openings" at the highest-intent step.
              key={serviceId ?? 'none'}
              slotsByDay={hydratedDays}
              selected={selectedSlot}
              onSelect={setSelectedSlot}
              timeZone={timeZone}
            />
          </section>

          {!isAuthenticated && (
            <section>
              <div className="flex items-center justify-between">
                <StepHeader n={detailsStep} label={t('stepDetails')} done={detailsDone} />
                <Link
                  href={`/login?next=/braiders/${braiderSlug}/book`}
                  className="mb-3 text-xs font-medium text-ink-muted underline underline-offset-4 hover:text-ink"
                >
                  {t('haveAccountLogIn')}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t('guestName')}
                  name="guest-name"
                  autoComplete="name"
                  placeholder={t('guestNamePlaceholder')}
                  maxLength={100}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
                <Input
                  label={t('guestEmail')}
                  name="guest-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t('guestEmailPlaceholder')}
                  maxLength={254}
                  hint={t('guestEmailHint')}
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
                <div className="sm:col-span-2">
                  <Input
                    label={t('guestPhone')}
                    name="guest-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t('guestPhonePlaceholder')}
                    maxLength={30}
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-ink-muted">
              {t('anythingHeading')}{' '}
              <span className="font-normal normal-case tracking-normal text-ink-subtle">
                {t('optional')}
              </span>
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              aria-label={t('notesAria')}
              placeholder={t('notesPlaceholder')}
              className={cn(fieldSurface, 'min-h-[84px] w-full resize-y px-3.5 py-2.5 leading-relaxed')}
            />
          </section>

          {/* Trust card — answers the three questions every first-time booker has
              before paying a deposit. Visible at every breakpoint. */}
          <ul className="space-y-2.5 rounded-card border border-line bg-paper/70 p-5 text-sm text-ink-muted">
            <li className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" strokeWidth={2.5} />
              <span>
                {t.rich('trustCancellation', {
                  hours: CANCELLATION_REFUND_WINDOW_HOURS,
                  strong: (chunks) => <span className="text-ink">{chunks}</span>
                })}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss" strokeWidth={2.5} />
              <span>
                {t.rich('trustDeposit', {
                  name: businessName,
                  strong: (chunks) => <span className="text-ink">{chunks}</span>
                })}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" strokeWidth={2} />
              <span>{t('trustCard')}</span>
            </li>
          </ul>

          {error && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-400 md:hidden">
              {error}
            </p>
          )}
        </div>

        {/* Desktop summary rail */}
        <aside className="hidden md:block">
          <div className="sticky top-6 rounded-card border border-line bg-paper p-6 shadow-soft">
            <p className="text-sm text-ink-muted">{t('yourBooking')}</p>
            <p className="mt-1 font-medium text-ink">
              {selectedService?.name ?? t('pickService')}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{whenLabel ?? t('chooseTime')}</p>

            {selectedService && (
              <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm tabular-nums">
                <div className="flex justify-between text-ink-muted">
                  <dt>{t('serviceTotal')}</dt>
                  <dd>{formatMoney(selectedService.price_cents)}</dd>
                </div>
                <div className="flex justify-between font-medium text-ink">
                  <dt>{t('depositDueNow')}</dt>
                  <dd className="font-display text-base">
                    {formatMoney(selectedService.deposit_cents)}
                  </dd>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <dt>{t('balanceAtAppointment')}</dt>
                  <dd>{formatMoney(selectedService.price_cents - selectedService.deposit_cents)}</dd>
                </div>
              </dl>
            )}

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            )}

            <Button onClick={submit} disabled={!ready || isPending} className="mt-6 w-full">
              {isPending ? t('reserving') : t('continueToDeposit')}
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-subtle">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
              {t('noChargeUntilConfirm')}
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile sticky action bar — keeps the deposit + CTA in reach without
          scrolling past the whole form. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0">
            <p className="text-xs text-ink-muted">
              {selectedService ? t('depositDueNow') : t('pickServiceTime')}
            </p>
            <p className="font-display text-xl leading-tight text-ink">
              {selectedService ? formatMoney(selectedService.deposit_cents) : '—'}
            </p>
          </div>
          <Button onClick={submit} disabled={!ready || isPending} size="lg" className="shrink-0">
            {isPending ? t('reserving') : t('continue')}
          </Button>
        </div>
      </div>
    </>
  );
}
