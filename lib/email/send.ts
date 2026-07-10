import 'server-only';
import { Resend } from 'resend';
import type { ReactElement } from 'react';
import { createLogger, maskEmail, errorInfo } from '@/lib/log';

const log = createLogger('email');

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
  if (!process.env.EMAIL_FROM && process.env.NODE_ENV === 'production') {
    log.error(
      'EMAIL_FROM unset in production — falling back to the Resend sandbox sender ' +
        '(poor deliverability, reaches only the account owner). Set EMAIL_FROM to a verified domain.'
    );
  }
  const from = process.env.EMAIL_FROM ?? 'BraidFlow <onboarding@resend.dev>';

  if (!r) {
    // Local dev without Resend configured — breadcrumb only. Mask the recipient so
    // no PII lands in logs even in the no-provider path.
    log.warn('skipped (no RESEND_API_KEY)', { subject, to: maskEmail(to) });
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
      // Log the message only — the raw error object can echo the recipient address.
      log.error('resend send failed', { subject, to: maskEmail(to), error: error.message });
      return { skipped: false as const, ok: false as const, error: error.message };
    }
    return { skipped: false as const, ok: true as const, id: data?.id };
  } catch (err) {
    log.error('send threw', { subject, to: maskEmail(to), ...errorInfo(err) });
    return { skipped: false as const, ok: false as const, error: 'send failed' };
  }
}
