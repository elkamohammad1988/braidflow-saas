import { NextResponse } from 'next/server';
import { addHours } from 'date-fns';
import { supabaseAdmin } from '@/lib/supabase/server';
import { notifyReminder } from '@/lib/email/notifications';
import { isAuthorizedCron } from '@/lib/cron/auth';
import { assertRuntimeEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type WindowKind = '24h' | '2h';

// Each window is sized at ~2x the cron cadence (hourly) so a single missed run
// still gets caught on the next tick.
type Window = {
  name: WindowKind;
  column: 'reminder_sent_at' | 'final_reminder_sent_at';
  startHours: number;
  endHours: number;
};

const WINDOWS: Window[] = [
  { name: '24h', column: 'reminder_sent_at', startHours: 23, endHours: 25 },
  { name: '2h', column: 'final_reminder_sent_at', startHours: 1, endHours: 3 }
];

// Build a typed single-column update for the window's reminder timestamp. A
// computed property key would widen to a string index signature that Supabase's
// generated Update type rejects, so branch on the literal column instead.
function reminderUpdate(column: Window['column'], value: string | null) {
  return column === 'reminder_sent_at'
    ? { reminder_sent_at: value }
    : { final_reminder_sent_at: value };
}

type RunResult = { window: WindowKind; claimed: number; failed: number };

export async function GET(req: Request) {
  assertRuntimeEnv();
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const admin = supabaseAdmin();
  const results: RunResult[] = [];

  for (const w of WINDOWS) {
    const startIso = addHours(now, w.startHours).toISOString();
    const endIso = addHours(now, w.endHours).toISOString();

    // Atomic claim — the partial-index'd update guarantees a row is only ever
    // picked up by one cron run, so we can't double-send even on concurrent hits.
    const { data, error } = await admin
      .from('bookings')
      .update(reminderUpdate(w.column, nowIso))
      .eq('status', 'confirmed')
      .is(w.column, null)
      .gte('scheduled_at', startIso)
      .lt('scheduled_at', endIso)
      .select('id');

    if (error) {
      console.error(`[cron/reminders] ${w.name} claim failed`, error);
      results.push({ window: w.name, claimed: 0, failed: 0 });
      continue;
    }

    const ids = (data ?? []).map((b) => b.id);
    const sendResults = await Promise.all(ids.map((id) => notifyReminder(id, w.name)));

    // Un-claim sends that failed so the next tick retries them (still bounded by
    // the time window). A duplicate reminder is preferable to a silent miss.
    const failedIds = ids.filter((_, i) => !sendResults[i]?.ok);
    if (failedIds.length > 0) {
      await admin
        .from('bookings')
        .update(reminderUpdate(w.column, null))
        .in('id', failedIds);
    }

    results.push({ window: w.name, claimed: ids.length, failed: failedIds.length });
  }

  return NextResponse.json({ ok: true, runs: results });
}
