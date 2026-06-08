import 'server-only';
import { Resend } from 'resend';
import type { ReactElement } from 'react';

let resend: Resend | null = null;

function client() {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}

type Args = {
  to: string;
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

export async function sendEmail({ to, subject, react, replyTo }: Args) {
  const r = client();
  const from = process.env.EMAIL_FROM ?? 'BraidFlow <onboarding@resend.dev>';

  if (!r) {
    // Local dev without Resend configured — log a one-line breadcrumb instead of crashing.
    console.warn(`[email] skipped (no RESEND_API_KEY) → "${subject}" to ${to}`);
    return { skipped: true as const };
  }

  try {
    const { data, error } = await r.emails.send({
      from,
      to,
      subject,
      react,
      replyTo
    });
    if (error) {
      console.error('[email] resend error', error);
      return { skipped: false as const, ok: false as const, error: error.message };
    }
    return { skipped: false as const, ok: true as const, id: data?.id };
  } catch (err) {
    console.error('[email] send threw', err);
    return { skipped: false as const, ok: false as const, error: 'send failed' };
  }
}
