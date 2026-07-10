import 'server-only';
import { dbAdmin } from '@/lib/db/server';
import { recordAuditLog } from '@/lib/audit/log';
import { retrieveAccountStatus, type ConnectAccountStatus } from '@/lib/stripe/connect';

type Admin = ReturnType<typeof dbAdmin>;

// Persisting Connect capability flags is shared between the webhook
// (account.updated) and the on-demand actions (return route / manual refresh),
// so it lives here in a plain server-only module rather than a 'use server' file
// — that keeps it out of the client-callable action surface.

/**
 * Write the latest Connect flags onto the braider row keyed by stripe_account_id.
 * Sets onboarding_completed_at exactly once — the first time charges go live — and
 * audit-logs that milestone. No-ops if no braider owns the account.
 */
export async function applyConnectStatus(
  admin: Admin,
  accountId: string,
  status: ConnectAccountStatus
): Promise<void> {
  const { data: braider } = await admin
    .from('braiders')
    .select('id, onboarding_completed_at')
    .eq('stripe_account_id', accountId)
    .maybeSingle();
  if (!braider) return;

  // Capability flags mirror Stripe's truth on every call. If Stripe has REVOKED
  // charges (requirements past-due, account rejected), also drop the braider out
  // of the public directory + sitemap: otherwise they keep showing there while
  // their book button dead-ends, since the profile computes
  // `open = accepting_bookings && charges_enabled`. We never auto-re-enable
  // accepting when charges come back — the braider opts back in from settings.
  await admin
    .from('braiders')
    .update({
      charges_enabled: status.chargesEnabled,
      payouts_enabled: status.payoutsEnabled,
      stripe_onboarding_complete: status.onboardingComplete,
      ...(status.chargesEnabled ? {} : { accepting_bookings: false })
    })
    .eq('id', braider.id);

  // Stamp the "first went live" milestone atomically. The return route and the
  // account.updated webhook can fire on the same account at once; both may read
  // onboarding_completed_at as null above, so we gate the write on `.is(null)` and
  // audit only if THIS update actually flipped it — so it's recorded exactly once.
  if (status.chargesEnabled && !braider.onboarding_completed_at) {
    const { data: stamped } = await admin
      .from('braiders')
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq('id', braider.id)
      .is('onboarding_completed_at', null)
      .select('id');

    if (stamped && stamped.length > 0) {
      await recordAuditLog({
        actorId: braider.id,
        action: 'connect.onboarded',
        entityType: 'braider',
        entityId: braider.id,
        metadata: { stripe_account_id: accountId }
      });
    }
  }
}

/**
 * Pull status from Stripe and persist it. Used by the return route and the manual
 * refresh so the dashboard reflects reality immediately, independent of webhook
 * delivery timing.
 */
export async function syncConnectStatus(accountId: string): Promise<ConnectAccountStatus> {
  const status = await retrieveAccountStatus(accountId);
  await applyConnectStatus(dbAdmin(), accountId, status);
  return status;
}
