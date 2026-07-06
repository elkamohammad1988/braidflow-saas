// Stripe configuration gate.
// -----------------------------------------------------------------------------
// The app ships as a self-contained, zero-config demo. A real Stripe integration
// (Connect destination charges) needs a platform secret key AND a real connected
// account per braider — neither of which a demo can assume. So when the Stripe
// keys are absent we run a *demo payment path*: the deposit is simulated
// server-side (no real charge, ever), which lets the full
// booking → deposit → confirmation → dashboard flow work out of the box.
//
// When BOTH keys are present the real Stripe path is used unchanged — set
// STRIPE_SECRET_KEY + NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (test keys) to switch a
// deployment onto real Stripe test mode.
//
// SERVER-ONLY: reads STRIPE_SECRET_KEY, which is never exposed to the browser.
// The pay page resolves the mode on the server and passes a `demo` flag to the
// client checkout — client code must not call this.

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  );
}
