'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { ServiceList, type Service } from '@/components/booking/service-list';
import { SlotPicker } from '@/components/booking/slot-picker';
import { Button } from '@/components/ui/button';
import { createBookingAction } from '@/lib/bookings/create';
import { formatMoney } from '@/lib/utils';

type SerializedDay = {
  date: string;
  slots: { start: string; end: string }[];
};

type Props = {
  services: Service[];
  slotsByService: Record<string, SerializedDay[]>;
  braiderSlug: string;
};

export function BookingFlow({ services, slotsByService, braiderSlug: _slug }: Props) {
  const [serviceId, setServiceId] = useState<string | undefined>(services[0]?.id);
  const [selectedSlot, setSelectedSlot] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedService = services.find((s) => s.id === serviceId);

  // Days are derived directly from the selected service's precomputed
  // availability — each service has its own duration, so its open slots differ.
  const days = serviceId ? slotsByService[serviceId] ?? [] : [];

  function onSelectService(id: string) {
    setServiceId(id);
    setSelectedSlot(undefined);
  }

  function submit() {
    if (!serviceId || !selectedSlot) return;
    setError(null);
    startTransition(async () => {
      const result = await createBookingAction({
        serviceId,
        scheduledAt: selectedSlot.toISOString(),
        clientNotes: notes || undefined
      });
      if (result && 'error' in result) setError(result.error);
    });
  }

  const hydratedDays = days.map((d) => ({
    date: new Date(d.date),
    slots: d.slots.map((s) => ({ start: new Date(s.start), end: new Date(s.end) }))
  }));

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">
            Service
          </h2>
          <ServiceList services={services} selectedId={serviceId} onSelect={onSelectService} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">
            Time
          </h2>
          <SlotPicker
            slotsByDay={hydratedDays}
            selected={selectedSlot}
            onSelect={setSelectedSlot}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-ink-muted">
            Anything we should know
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            aria-label="Notes for your braider"
            placeholder="Hair texture, length, preferred parting…"
            className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </section>
      </div>

      <aside className="md:sticky md:top-6 md:self-start">
        <div className="rounded-card border border-ink/5 bg-white p-6 shadow-soft">
          <p className="text-sm text-ink-muted">Your booking</p>
          <p className="mt-1 font-medium text-ink">
            {selectedService?.name ?? 'Pick a service'}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {selectedSlot
              ? format(selectedSlot, "EEE, MMM d · h:mm a")
              : 'Choose a time'}
          </p>

          {selectedService && (
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Service price</dt>
                <dd>{formatMoney(selectedService.price_cents)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>Deposit due now</dt>
                <dd>{formatMoney(selectedService.deposit_cents)}</dd>
              </div>
              <p className="pt-1 text-xs text-ink-muted">
                Balance is paid in person at your appointment.
              </p>
            </dl>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <Button
            onClick={submit}
            disabled={!serviceId || !selectedSlot || isPending}
            className="mt-6 w-full"
          >
            {isPending ? 'Reserving…' : 'Continue to deposit'}
          </Button>
        </div>
      </aside>
    </div>
  );
}
