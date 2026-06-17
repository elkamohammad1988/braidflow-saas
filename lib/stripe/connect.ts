import 'server-only';
import type Stripe from 'stripe';
import { stripe } from './client';

// Stripe Connect (Express) helpers. Braiders onboard a connected account so client
// deposits can be routed to them (destination charges). The platform stays the
// payments integrator; account/payment/refund events still arrive on the platform
// webhook, so the existing handler keeps working unchanged.

export type ConnectAccountStatus = {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  // Stripe's account.details_submitted — the braider finished the onboarding
  // form. Charges may still be pending review.
  onboardingComplete: boolean;
};

/** Create an Express connected account for a braider. Returns the account id. */
export async function createExpressAccount(params: {
  braiderId: string;
  email?: string | null;
}): Promise<string> {
  const account = await stripe.accounts.create({
    type: 'express',
    // card_payments + transfers are what destination charges with on_behalf_of
    // require (braider is merchant of record and receives the funds).
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    },
    business_type: 'individual',
    email: params.email ?? undefined,
    // Lets the account.updated webhook map an event back to a braider even if the
    // unique-index lookup is ever insufficient.
    metadata: { braider_id: params.braiderId }
  });
  return account.id;
}

/** Mint a one-time hosted onboarding link for an account. */
export async function createOnboardingLink(
  accountId: string,
  urls: { refreshUrl: string; returnUrl: string }
): Promise<string> {
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: 'account_onboarding',
    refresh_url: urls.refreshUrl,
    return_url: urls.returnUrl
  });
  return link.url;
}

export function readAccountStatus(account: Stripe.Account): ConnectAccountStatus {
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    onboardingComplete: account.details_submitted
  };
}

/** Pull the current capability status straight from Stripe. */
export async function retrieveAccountStatus(accountId: string): Promise<ConnectAccountStatus> {
  const account = await stripe.accounts.retrieve(accountId);
  return readAccountStatus(account);
}
