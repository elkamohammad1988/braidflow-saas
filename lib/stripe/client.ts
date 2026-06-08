import Stripe from 'stripe';

let instance: Stripe | null = null;

function getStripe(): Stripe {
  if (!instance) {
    instance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
      typescript: true
    });
  }
  return instance;
}

// Lazily instantiate the Stripe client so that merely importing this module
// doesn't require STRIPE_SECRET_KEY to be present. Without this, `next build`
// throws during page-data collection on machines that don't have the secret
// set. The real client is created on first property access and reused after.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripe();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
