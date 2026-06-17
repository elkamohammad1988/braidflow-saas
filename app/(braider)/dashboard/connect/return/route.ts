import { NextResponse } from 'next/server';
import { refreshConnectStatus } from '@/lib/braider/connect';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe sends the braider here after they finish (or exit) onboarding. Sync the
// account's live status immediately so the dashboard reflects it without waiting
// for the account.updated webhook, then bounce back to the dashboard with a hint
// so the activation checklist and confirmation banner are right there.
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app';
  const result = await refreshConnectStatus();
  const state = 'error' in result ? 'pending' : result.chargesEnabled ? 'done' : 'pending';
  return NextResponse.redirect(new URL(`/dashboard?connect=${state}`, base));
}
