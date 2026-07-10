import { beforeEach, describe, expect, it } from 'vitest';
import { dbAdmin } from '@/lib/db/server';
import { resetStore } from '@/lib/db/store';
import { applyConnectStatus } from './connect-sync';
import { readAccountStatus } from '@/lib/stripe/connect';

// applyConnectStatus mirrors Stripe's Connect flags onto a braider. Two behaviors
// carry real product/accounting weight: dropping a charges-revoked braider out of
// the public directory, and stamping the onboarding milestone exactly once.

// The seeded "your-studio" braider onboards fresh (onboarding_completed_at: null).
const SLUG = 'your-studio';

async function braiderBySlug() {
  const { data } = await dbAdmin()
    .from('braiders')
    .select('id, accepting_bookings, charges_enabled, onboarding_completed_at')
    .eq('slug', SLUG)
    .maybeSingle();
  return data!;
}

async function onboardedAuditCount(braiderId: string) {
  const { data } = await dbAdmin()
    .from('audit_logs')
    .select('id')
    .eq('action', 'connect.onboarded')
    .eq('entity_id', braiderId);
  return (data ?? []).length;
}

describe('applyConnectStatus', () => {
  beforeEach(() => resetStore());

  it('clears accepting_bookings when Stripe revokes charges', async () => {
    const b = await braiderBySlug();
    await dbAdmin()
      .from('braiders')
      .update({ stripe_account_id: 'acct_revoke', accepting_bookings: true, charges_enabled: true })
      .eq('id', b.id);

    await applyConnectStatus(dbAdmin(), 'acct_revoke', {
      chargesEnabled: false,
      payoutsEnabled: false,
      onboardingComplete: true
    });

    const after = await braiderBySlug();
    expect(after.charges_enabled).toBe(false);
    expect(after.accepting_bookings).toBe(false); // dropped from the public directory
  });

  it('stamps the onboarding milestone and audits it exactly once, even under a repeated call (webhook + return-route race)', async () => {
    const b = await braiderBySlug();
    await dbAdmin().from('braiders').update({ stripe_account_id: 'acct_live' }).eq('id', b.id);
    const status = { chargesEnabled: true, payoutsEnabled: true, onboardingComplete: true };

    await applyConnectStatus(dbAdmin(), 'acct_live', status);
    await applyConnectStatus(dbAdmin(), 'acct_live', status); // duplicate delivery

    const after = await braiderBySlug();
    expect(after.charges_enabled).toBe(true);
    expect(after.onboarding_completed_at).not.toBeNull();
    expect(await onboardedAuditCount(b.id)).toBe(1);
  });

  it('no-ops for an account not linked to any braider', async () => {
    await expect(
      applyConnectStatus(dbAdmin(), 'acct_nobody', {
        chargesEnabled: true,
        payoutsEnabled: true,
        onboardingComplete: true
      })
    ).resolves.toBeUndefined();
  });

  it('readAccountStatus maps Stripe fields to our shape', () => {
    expect(
      readAccountStatus({
        charges_enabled: true,
        payouts_enabled: false,
        details_submitted: true
      } as never)
    ).toEqual({ chargesEnabled: true, payoutsEnabled: false, onboardingComplete: true });
  });
});
