import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { dbAdmin } from '@/lib/db/server';
import { resetStore } from '@/lib/db/store';

// The reminder cron atomically CLAIMS a booking (stamps reminder_sent_at) before
// sending, and UN-CLAIMS it if the send fails so the next tick retries. These lock
// that a reminder is sent once on success and re-armed on failure.

const { notifyReminder } = vi.hoisted(() => ({ notifyReminder: vi.fn() }));
vi.mock('@/lib/email/notifications', () => ({ notifyReminder }));

import { GET } from './route';

const savedSecret = process.env.CRON_SECRET;
beforeEach(async () => {
  resetStore();
  // Empty the bookings so a seeded confirmed booking that happens to fall in the
  // 24h/2h window can't perturb the notifyReminder call assertions.
  await dbAdmin().from('bookings').delete();
  vi.clearAllMocks();
  notifyReminder.mockResolvedValue({ ok: true });
  process.env.CRON_SECRET = 'cron-secret-value';
});
afterAll(() => {
  if (savedSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = savedSecret;
});

const authed = () =>
  new Request('http://localhost/api/cron/reminders', {
    headers: { authorization: 'Bearer cron-secret-value' }
  });

const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

async function seedConfirmed(id: string, scheduledAt: string) {
  await dbAdmin().from('bookings').insert({
    id,
    braider_id: 'braider-x',
    service_id: 'svc',
    scheduled_at: scheduledAt,
    duration_minutes: 120,
    price_cents: 10000,
    deposit_cents: 2000,
    status: 'confirmed',
    reminder_sent_at: null,
    final_reminder_sent_at: null
  });
}

const reminderSentAt = async (id: string) =>
  (await dbAdmin().from('bookings').select('reminder_sent_at').eq('id', id).maybeSingle()).data?.reminder_sent_at;

describe('reminders cron', () => {
  it('rejects an unauthenticated request', async () => {
    const res = await GET(new Request('http://localhost/api/cron/reminders'));
    expect(res.status).toBe(401);
  });

  it('claims and sends the 24h reminder for a booking ~24h out', async () => {
    await seedConfirmed('bk_24', inHours(24));
    const res = await GET(authed());
    expect(res.status).toBe(200);
    expect(await reminderSentAt('bk_24')).not.toBeNull();
    expect(notifyReminder).toHaveBeenCalledWith('bk_24', '24h');
  });

  it('does not remind a booking outside the window', async () => {
    await seedConfirmed('bk_far', inHours(72));
    await GET(authed());
    expect(await reminderSentAt('bk_far')).toBeNull();
    expect(notifyReminder).not.toHaveBeenCalled();
  });

  it('un-claims the reminder when the send fails, so the next tick retries', async () => {
    notifyReminder.mockResolvedValue({ ok: false });
    await seedConfirmed('bk_retry', inHours(24));
    await GET(authed());
    expect(await reminderSentAt('bk_retry')).toBeNull(); // reset for retry
  });

  it('does not re-send a reminder already sent (idempotent claim)', async () => {
    await seedConfirmed('bk_done', inHours(24));
    await dbAdmin().from('bookings').update({ reminder_sent_at: new Date().toISOString() }).eq('id', 'bk_done');
    await GET(authed());
    expect(notifyReminder).not.toHaveBeenCalled();
  });
});
