import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db/server';
import { isAuthorizedCron } from '@/lib/cron/auth';
import { assertRuntimeEnv } from '@/lib/env';
import { expireStaleHolds } from '@/lib/bookings/expire-holds';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Each stale hold costs one synchronous Stripe call, so cap wall-clock. This is
// the GLOBAL backstop sweep; the booking/create/reschedule paths also release
// stale holds lazily (lib/bookings/expire-holds), so an abandoned hold frees its
// slot at the TTL as soon as anyone looks at or competes for it — this cron just
// catches holds nobody touches. SCHEDULE lives in vercel.json (daily on the
// Vercel Hobby cron limit; tighten to e.g. */15 on a capable plan). See
// docs/DEPLOYMENT.md.
export const maxDuration = 60;

const EXPIRE_BATCH = 100;

export async function GET(req: Request) {
  assertRuntimeEnv();
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const expired = await expireStaleHolds(dbAdmin(), { limit: EXPIRE_BATCH });
  return NextResponse.json({ ok: true, expired });
}
