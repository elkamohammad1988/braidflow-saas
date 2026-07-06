'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { SlotPicker } from '@/components/booking/slot-picker';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { rescheduleBookingAction } from '@/lib/bookings/reschedule';
import { formatInZone, zoneAbbreviation } from '@/lib/format-date';

type SerializedDay = {
  date: string;
  slots: { start: string; end: string }[];
};

type Props = {
  bookingId: string;
  currentScheduledAt: string;
  businessName: string;
  serviceName: string;
  slotsByDay: SerializedDay[];
  returnTo: string;
  timeZone: string;
  // Guest capability token; forwarded to authorize a guest's reschedule.
  token?: string;
};

export function RescheduleFlow({
  bookingId,
  currentScheduledAt,
  businessName,
  serviceName,
  slotsByDay,
  returnTo,
  timeZone,
  token
}: Props) {
  const t = useTranslations('reschedule');
  const fmt = (d: Date) =>
    `${formatInZone(d, timeZone, "EEE, MMM d 'at' h:mm a")} ${zoneAbbreviation(d, timeZone)}`;
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const redirectTimer = useRef<ReturnType<typeof setTimeout>>();

  // Clear the post-success redirect timer if the user navigates away first.
  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const currentTime = new Date(currentScheduledAt);

  const hydratedDays = slotsByDay.map((d) => ({
    date: new Date(d.date),
    slots: d.slots.map((s) => ({ start: new Date(s.start), end: new Date(s.end) }))
  }));

  function submit() {
    if (!selectedSlot) return;
    setError(null);
    startTransition(async () => {
      const result = await rescheduleBookingAction(bookingId, selectedSlot.toISOString(), token);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      // Give the success state a beat before bouncing back.
      redirectTimer.current = setTimeout(() => router.push(returnTo), 1200);
    });
  }

  if (success && selectedSlot) {
    return (
      <div className="motion-safe:animate-fade-in-up rounded-card border border-line bg-paper p-8 text-center shadow-soft">
        <span className="motion-safe:animate-pop-in mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-moss/12 text-moss ring-1 ring-moss/15">
          <Check className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <p className="font-display text-2xl text-ink">{t('moved')}</p>
        <p className="mt-2 text-sm text-ink-muted">
          {t('movedBody', { business: businessName, time: fmt(selectedSlot) })}
        </p>
        <p className="mt-1 text-xs text-ink-muted">{t('takingBack')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <div className="rounded-card border border-line bg-paper px-5 py-4 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-ink-muted">{t('currentlyScheduled')}</p>
          <p className="mt-1 font-medium text-ink">{fmt(currentTime)}</p>
          <p className="text-sm text-ink-muted">{serviceName}</p>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">
            {t('newTime')}
          </h2>
          <SlotPicker
            slotsByDay={hydratedDays}
            selected={selectedSlot}
            onSelect={setSelectedSlot}
            timeZone={timeZone}
          />
        </section>
      </div>

      <aside className="md:sticky md:top-6 md:self-start">
        <div className="rounded-card border border-line bg-paper p-6 shadow-soft">
          <p className="text-sm text-ink-muted">{t('newAppointment')}</p>
          <p className="mt-1 font-medium text-ink">
            {selectedSlot ? fmt(selectedSlot) : t('pickATime')}
          </p>

          {selectedSlot && (
            <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-xs text-ink-muted">
              {t('depositTransfers')}
            </p>
          )}

          {error && (
            <p className="motion-safe:animate-fade-in-up mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            onClick={submit}
            disabled={!selectedSlot || pending}
            className="mt-6 w-full"
          >
            {pending ? (
              <>
                <Spinner className="me-2" />
                {t('confirming')}
              </>
            ) : (
              t('confirmNewTime')
            )}
          </Button>

          <Link
            href={returnTo}
            className="mt-3 block text-center text-sm text-ink-muted hover:text-ink"
          >
            {t('keepCurrentTime')}
          </Link>
        </div>
      </aside>
    </div>
  );
}
