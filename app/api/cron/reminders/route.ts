import { NextResponse } from 'next/server';
import { addHours } from 'date-fns';
import { supabaseAdmin } from '@/lib/supabase/server';
import { notifyReminder } from '@/lib/email/notifications';
import { isAuthorizedCron } from '@/lib/cron/auth';
import { assertRuntimeEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Cap wall-clock so a large backlog can't run past the platform's function limit
// and get killed mid-send (which would leave reminders claimed-but-unsent).
export const maxDuration = 60;

// Max reminders processed per window per run. Each window is ~2h wide and the
// cron is hourly, so any overflow is picked up on the next tick. Tune up once a
// queue replaces the inline send.
const REMINDER_BATCH = 100;

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

    // Bound the batch so one run stays within maxDuration even with a backlog.
    // PostgREST can't LIMIT an UPDATE, so pre-select the ids to claim.
    const { data: due, error: dueError } = await admin
      .from('bookings')
      .select('id')
      .eq('status', 'confirmed')
      .is(w.column, null)
      .gte('scheduled_at', startIso)
      .lt('scheduled_at', endIso)
      .limit(REMINDER_BATCH);

    if (dueError) {
      console.error(`[cron/reminders] ${w.name} lookup failed`, dueError);
      results.push({ window: w.name, claimed: 0, failed: 0 });
      continue;
    }

    const candidateIds = (due ?? []).map((b) => b.id);
    if (candidateIds.length === 0) {
      results.push({ window: w.name, claimed: 0, failed: 0 });
      continue;
    }

    // Atomic claim, restricted to this batch. The .is(column, null) guard still
    // guarantees each row is claimed by exactly one run, so concurrent crons
    // can't double-send even if they pre-selected overlapping ids.
    const { data, error } = await admin
      .from('bookings')
      .update(reminderUpdate(w.column, nowIso))
      .in('id', candidateIds)
      .eq('status', 'confirmed')
      .is(w.column, null)
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
