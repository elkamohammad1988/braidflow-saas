'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { requireBraider } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/audit/log';
import { captureException } from '@/lib/monitoring';
import { createExpressAccount, createOnboardingLink } from '@/lib/stripe/connect';
import { ensureBraiderRecord } from './ensure';
import { syncConnectStatus } from './connect-sync';

function connectUrls() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app';
  return {
    refreshUrl: `${base}/dashboard/connect/refresh`,
    returnUrl: `${base}/dashboard/connect/return`
  };
}

/**
 * Begin (or resume) Stripe Connect onboarding. Creates the connected account on
 * first call and stores its id, then returns a fresh hosted onboarding URL for
 * the browser to navigate to.
 */
export async function startStripeOnboarding(): Promise<{ url: string } | { error: string }> {
  const { user, profile } = await requireBraider();

  // The booking page and settings already self-heal the braider row; do the same
  // here so onboarding works on a first-ever dashboard action.
  const ensured = await ensureBraiderRecord(user.id, profile.full_name);
  if ('error' in ensured) return { error: ensured.error };

  const admin = supabaseAdmin();
  const { data: braider } = await admin
    .from('braiders')
    .select('stripe_account_id')
    .eq('id', user.id)
    .maybeSingle();
  if (!braider) return { error: 'Your braider profile is missing — refresh and try again.' };

  try {
    let accountId = braider.stripe_account_id;
    if (!accountId) {
      accountId = await createExpressAccount({ braiderId: user.id, email: user.email });
      const { error } = await admin
        .from('braiders')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);
      if (error) {
        // Don't leave a created-but-unlinked Stripe account silently: surface it.
        captureException(error, { stage: 'connect.link_account', braiderId: user.id });
        return { error: 'Could not save your Stripe account. Try again.' };
      }
      await recordAuditLog({
        actorId: user.id,
        action: 'connect.account_created',
        entityType: 'braider',
        entityId: user.id,
        metadata: { stripe_account_id: accountId }
      });
    }

    const url = await createOnboardingLink(accountId, connectUrls());
    return { url };
  } catch (err) {
    captureException(err, { stage: 'connect.onboarding', braiderId: user.id });
    return { error: 'Could not start Stripe setup. Please try again.' };
  }
}

/**
 * Re-sync the braider's Connect status from Stripe on demand (used by the return
 * route and a manual "refresh" affordance), so the UI doesn't depend on webhook
 * delivery timing.
 */
export async function refreshConnectStatus(): Promise<
  { ok: true; chargesEnabled: boolean } | { error: string }
> {
  const { user } = await requireBraider();
  const admin = supabaseAdmin();
  const { data: braider } = await admin
    .from('braiders')
    .select('stripe_account_id')
    .eq('id', user.id)
    .maybeSingle();
  if (!braider?.stripe_account_id) return { error: 'Start Stripe setup first.' };

  try {
    const status = await syncConnectStatus(user.id, braider.stripe_account_id);
    return { ok: true, chargesEnabled: status.chargesEnabled };
  } catch (err) {
    captureException(err, { stage: 'connect.refresh', braiderId: user.id });
    return { error: 'Could not refresh your Stripe status.' };
  }
}
