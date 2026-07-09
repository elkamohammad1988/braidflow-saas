// Email configuration gate.
// -----------------------------------------------------------------------------
// Transactional email (reset links, booking notifications) needs a Resend API
// key. Without one the app runs as a self-contained demo and sends nothing — so
// any flow that would otherwise email (e.g. a password-reset link) explains its
// demo behavior honestly instead of claiming a message was sent.
//
// Mirrors lib/stripe/config.ts so both integrations gate the same way.

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
