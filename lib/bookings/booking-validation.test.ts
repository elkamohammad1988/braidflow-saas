import { describe, expect, it } from 'vitest';
import { createBookingSchema, guestContactSchema } from './validation';

const SERVICE_ID = 'a0000000-0000-4000-8000-000000000001';
const FUTURE = '2999-01-01T15:00:00.000Z';

// The create action re-validates every untrusted booking request through this
// schema before any slot check or Stripe call, so its guarantees matter.

describe('createBookingSchema', () => {
  it('accepts a well-formed authenticated booking (no guest block)', () => {
    const parsed = createBookingSchema.safeParse({
      serviceId: SERVICE_ID,
      scheduledAt: FUTURE
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts a guest booking with contact details', () => {
    const parsed = createBookingSchema.safeParse({
      serviceId: SERVICE_ID,
      scheduledAt: FUTURE,
      guest: { name: 'Simone Carter', email: 'Simone@Example.com', phone: '(404) 555-0198' }
    });
    expect(parsed.success).toBe(true);
    // Email is normalized to lowercase so the same person resolves consistently.
    if (parsed.success) expect(parsed.data.guest?.email).toBe('simone@example.com');
  });

  it('rejects a non-UUID service id', () => {
    const parsed = createBookingSchema.safeParse({ serviceId: 'not-a-uuid', scheduledAt: FUTURE });
    expect(parsed.success).toBe(false);
  });

  it('rejects a non-ISO scheduledAt', () => {
    const parsed = createBookingSchema.safeParse({ serviceId: SERVICE_ID, scheduledAt: 'tomorrow' });
    expect(parsed.success).toBe(false);
  });

  it('rejects an over-long note', () => {
    const parsed = createBookingSchema.safeParse({
      serviceId: SERVICE_ID,
      scheduledAt: FUTURE,
      clientNotes: 'x'.repeat(501)
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a guest block with an invalid email', () => {
    const parsed = createBookingSchema.safeParse({
      serviceId: SERVICE_ID,
      scheduledAt: FUTURE,
      guest: { name: 'No Email', email: 'nope' }
    });
    expect(parsed.success).toBe(false);
  });
});

describe('guestContactSchema', () => {
  it('requires a name', () => {
    expect(guestContactSchema.safeParse({ name: '', email: 'a@b.com' }).success).toBe(false);
  });
});
