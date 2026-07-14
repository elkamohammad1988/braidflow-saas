import { beforeEach, describe, expect, it } from 'vitest';
import { dbAdmin } from '@/lib/db/server';
import { resetStore } from '@/lib/db/store';

// Regression guard for the store-wide timestamp invariant. The in-memory engine
// compares/sorts `scheduled_at` LEXICOGRAPHICALLY, and every runtime writer
// stores UTC-Z (`…:00.000Z`). If the seed ever writes an OFFSET string again
// (e.g. via `TZDate.toISOString()`, which yields `…-04:00`), lexicographic order
// stops matching chronological order and seeded rows mis-filter/mis-sort — a
// booking can silently vanish from a week view.

beforeEach(() => resetStore());

describe('seed timestamps', () => {
  it('writes every scheduled_at as a UTC-Z instant', async () => {
    const { data } = await dbAdmin().from('bookings').select('scheduled_at');
    expect((data ?? []).length).toBeGreaterThan(0);
    for (const b of data ?? []) {
      expect(b.scheduled_at).toMatch(/T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    }
  });

  it('keeps lexicographic order == chronological order across all seeded rows', async () => {
    const { data } = await dbAdmin().from('bookings').select('scheduled_at').order('scheduled_at');
    const times = (data ?? []).map((b) => b.scheduled_at as string);
    const chronological = [...times].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    // The engine sorts as raw strings; that must equal the true instant order.
    expect(times).toEqual(chronological);
  });
});
