import { beforeEach, describe, expect, it } from 'vitest';
import { dbAdmin } from '@/lib/db/server';
import { resetStore } from '@/lib/db/store';

// The in-memory query builder is the backbone every server action runs on, and
// its emulated PostgREST semantics (embedded joins, 23505 uniqueness, upsert,
// ordering, single/maybeSingle) are what the money-path idempotency logic relies
// on. These lock that behavior in.

const AMARA = '00000000-0000-4000-8000-000000000001';

describe('query builder', () => {
  beforeEach(() => resetStore());

  it('filters rows with eq and returns typed columns', async () => {
    const { data, error } = await dbAdmin()
      .from('services')
      .select('id, name, is_active')
      .eq('braider_id', AMARA);
    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((s) => typeof s.name === 'string')).toBe(true);
  });

  it('resolves an embedded one-relation (bookings → services)', async () => {
    const { data } = await dbAdmin()
      .from('bookings')
      .select('id, services(name)')
      .eq('braider_id', AMARA);
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((b) => typeof b.services?.name === 'string')).toBe(true);
  });

  it('resolves an embedded many-relation (bookings → payments[])', async () => {
    const { data } = await dbAdmin().from('bookings').select('id, payments(kind, status)');
    const withPayment = data.find((b) => (b.payments ?? []).length > 0);
    expect(withPayment).toBeDefined();
    expect(Array.isArray(withPayment?.payments)).toBe(true);
  });

  it('raises 23505 on a duplicate unique column (braider slug)', async () => {
    const { error } = await dbAdmin()
      .from('braiders')
      .insert({ slug: 'amara-braids', business_name: 'Impostor Studio' });
    expect(error?.code).toBe('23505');
  });

  it('upsert updates the conflicting row instead of duplicating it', async () => {
    const eventId = 'evt_test_123';
    await dbAdmin().from('stripe_webhook_events').upsert({ id: eventId, type: 'a' }, { onConflict: 'id' });
    await dbAdmin().from('stripe_webhook_events').upsert({ id: eventId, type: 'b' }, { onConflict: 'id' });
    const { data } = await dbAdmin().from('stripe_webhook_events').select('id, type').eq('id', eventId);
    expect(data).toHaveLength(1);
    expect(data[0]?.type).toBe('b');
  });

  it('orders descending and limits', async () => {
    const { data } = await dbAdmin()
      .from('bookings')
      .select('scheduled_at')
      .eq('braider_id', AMARA)
      .order('scheduled_at', { ascending: false })
      .limit(3);
    expect(data.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < data.length; i++) {
      expect(data[i - 1]!.scheduled_at >= data[i]!.scheduled_at).toBe(true);
    }
  });

  it('maybeSingle returns null (no error) when nothing matches', async () => {
    const { data, error } = await dbAdmin()
      .from('braiders')
      .select('id')
      .eq('slug', 'does-not-exist')
      .maybeSingle();
    expect(data).toBeNull();
    expect(error).toBeNull();
  });

  it('single errors (PGRST116) when nothing matches', async () => {
    const { data, error } = await dbAdmin()
      .from('braiders')
      .select('id')
      .eq('slug', 'does-not-exist')
      .single();
    expect(data).toBeNull();
    expect(error?.code).toBe('PGRST116');
  });

  it('update returns the affected rows via select (0 rows on wrong owner)', async () => {
    const mine = await dbAdmin()
      .from('services')
      .update({ is_active: false })
      .eq('braider_id', AMARA)
      .select('id');
    expect(mine.data.length).toBeGreaterThan(0);

    const wrongOwner = await dbAdmin()
      .from('services')
      .update({ is_active: false })
      .eq('braider_id', 'not-a-real-braider')
      .select('id');
    expect(wrongOwner.data).toHaveLength(0);
  });

  it('count/head returns a count without rows', async () => {
    const { data, count } = await dbAdmin()
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('braider_id', AMARA);
    expect(data).toBeNull();
    expect(typeof count).toBe('number');
    expect(count!).toBeGreaterThan(0);
  });

  it('delete removes matching rows and leaves the rest', async () => {
    const before = (await dbAdmin().from('services').select('id').eq('braider_id', AMARA)).data.length;
    const first = (await dbAdmin().from('services').select('id').eq('braider_id', AMARA)).data[0]!;
    await dbAdmin().from('services').delete().eq('id', first.id);
    const after = (await dbAdmin().from('services').select('id').eq('braider_id', AMARA)).data.length;
    expect(after).toBe(before - 1);
  });
});
