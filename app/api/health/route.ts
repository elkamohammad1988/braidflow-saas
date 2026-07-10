import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db/server';
import { isStripeConfigured } from '@/lib/stripe/config';
import { isEmailConfigured } from '@/lib/email/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Liveness + readiness probe for load balancers, uptime monitors, and container
// orchestrators. Verifies the data layer actually responds (not just that the
// process is up) and reports which optional integrations are live — without
// leaking any secret values.
export async function GET() {
  const startedAt = Date.now();
  let dataOk = false;
  try {
    // A trivial read exercises the store/query path end to end.
    const { error } = await dbAdmin().from('services').select('id').limit(1);
    dataOk = !error;
  } catch {
    dataOk = false;
  }

  const body = {
    status: dataOk ? 'ok' : 'degraded',
    // The deployed commit, so an uptime monitor can verify exactly what's live and
    // gate a rollback on it. Vercel sets VERCEL_GIT_COMMIT_SHA; falls back to 'dev'.
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev',
    checks: {
      data: dataOk ? 'ok' : 'error'
    },
    integrations: {
      stripe: isStripeConfigured() ? 'live' : 'demo',
      email: isEmailConfigured() ? 'live' : 'demo'
    },
    uptimeSeconds: Math.round(process.uptime()),
    responseMs: Date.now() - startedAt
  };

  return NextResponse.json(body, {
    status: dataOk ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' }
  });
}
