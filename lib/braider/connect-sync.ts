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

  const firstTimeLive = status.chargesEnabled && !braider.onboarding_completed_at;

  await admin
    .from('braiders')
    .update({
      charges_enabled: status.chargesEnabled,
      payouts_enabled: status.payoutsEnabled,
      stripe_onboarding_complete: status.onboardingComplete,
      ...(firstTimeLive ? { onboarding_completed_at: new Date().toISOString() } : {})
    })
    .eq('id', braider.id);

  if (firstTimeLive) {
    await recordAuditLog({
      actorId: braider.id,
      action: 'connect.onboarded',
      entityType: 'braider',
      entityId: braider.id,
      metadata: { stripe_account_id: accountId }
    });
  }
}

/**
 * Pull status from Stripe and persist it. Used by the return route and the manual
 * refresh so the dashboard reflects reality immediately, independent of webhook
 * delivery timing.
 */
export async function syncConnectStatus(
  braiderId: string,
  accountId: string
): Promise<ConnectAccountStatus> {
  const status = await retrieveAccountStatus(accountId);
  await applyConnectStatus(dbAdmin(), accountId, status);
  return status;
}
