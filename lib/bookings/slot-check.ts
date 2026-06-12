import {
  computeSlotsForDay,
  type AvailabilityRule,
  type AvailabilityOverride,
  type ExistingBooking
} from './availability';

// True when `requestedStart` is a genuinely bookable slot for the service: it
// must land on the braider's published availability for that day, align to the
// slot grid, avoid blocks/overrides and existing bookings, and not be in the
// past. This re-derives the exact same slots the booking UI offers, so the
// server can reject anything a tampered or stale client submits.
export function isSlotBookable(
  requestedStart: Date,
  serviceDurationMinutes: number,
  rules: AvailabilityRule[],
  overrides: AvailabilityOverride[],
  bookings: ExistingBooking[]
): boolean {
  const slots = computeSlotsForDay(
    requestedStart,
    serviceDurationMinutes,
    rules,
    overrides,
    bookings
  );
  const target = requestedStart.getTime();
  return slots.some((s) => s.start.getTime() === target);
}
