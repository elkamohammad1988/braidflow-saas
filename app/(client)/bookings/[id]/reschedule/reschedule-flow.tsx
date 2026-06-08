'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { SlotPicker } from '@/components/booking/slot-picker';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { rescheduleBookingAction } from '@/lib/bookings/reschedule';

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
};

export function RescheduleFlow({
  bookingId,
  currentScheduledAt,
  businessName,
  serviceName,
  slotsByDay,
  returnTo
}: Props) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const currentTime = new Date(currentScheduledAt);

  const hydratedDays = slotsByDay.map((d) => ({
    date: new Date(d.date),
    slots: d.slots.map((s) => ({ start: new Date(s.start), end: new Date(s.end) }))
  }));

  function submit() {
    if (!selectedSlot) return;
    setError(null);
    startTransition(async () => {
      const result = await rescheduleBookingAction(bookingId, selectedSlot.toISOString());
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      // Give the success state a beat before bouncing back.
      setTimeout(() => router.push(returnTo), 1200);
    });
  }

  if (success && selectedSlot) {
    return (
      <div className="motion-safe:animate-fade-in-up rounded-card border border-ink/5 bg-white p-8 text-center shadow-soft">
        <p className="font-display text-2xl text-ink">Moved.</p>
        <p className="mt-2 text-sm text-ink-muted">
          Your appointment with {businessName} is now {format(selectedSlot, "EEE, MMM d 'at' h:mm a")}.
        </p>
        <p className="mt-1 text-xs text-ink-muted">Taking you back…</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <div className="rounded-card border border-ink/5 bg-white px-5 py-4 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-ink-muted">Currently scheduled</p>
          <p className="mt-1 font-medium text-ink">
            {format(currentTime, "EEE, MMM d 'at' h:mm a")}
          </p>
          <p className="text-sm text-ink-muted">{serviceName}</p>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">
            New time
          </h2>
          <SlotPicker
            slotsByDay={hydratedDays}
            selected={selectedSlot}
            onSelect={setSelectedSlot}
          />
        </section>
      </div>

      <aside className="md:sticky md:top-6 md:self-start">
        <div className="rounded-card border border-ink/5 bg-white p-6 shadow-soft">
          <p className="text-sm text-ink-muted">New appointment</p>
          <p className="mt-1 font-medium text-ink">
            {selectedSlot
              ? format(selectedSlot, "EEE, MMM d 'at' h:mm a")
              : 'Pick a time'}
          </p>

          {selectedSlot && (
            <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-xs text-ink-muted">
              Your deposit transfers automatically.
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
                <Spinner className="mr-2" />
                Confirming…
              </>
            ) : (
              'Confirm new time'
            )}
          </Button>

          <Link
            href={returnTo}
            className="mt-3 block text-center text-sm text-ink-muted hover:text-ink"
          >
            Keep current time
          </Link>
        </div>
      </aside>
    </div>
  );
}
