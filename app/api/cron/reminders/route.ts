import { NextResponse } from 'next/server';
import { addHours } from 'date-fns';
import { supabaseAdmin } from '@/lib/supabase/server';
import { notifyReminder } from '@/lib/email/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type WindowKind = '24h' | '2h';

// Each window is sized at ~2x the cron cadence (hourly) so a single missed run
// still gets caught on the next tick.
type Window = {
  name: WindowKind;
  startHours: number;
  endHours: number;
  claim: (admin: ReturnType<typeof supabaseAdmin>, nowIso: string, startIso: string, endIso: string) => Promise<{ ids: string[]; error: unknown }>;
};

const WINDOWS: Window[] = [
  {
    name: '24h',
    startHours: 23,
    endHours: 25,
    async claim(admin, nowIso, startIso, endIso) {
      const { data, error } = await admin
        .from('bookings')
        .update({ reminder_sent_at: nowIso })
        .eq('status', 'confirmed')
        .is('reminder_sent_at', null)
        .gte('scheduled_at', startIso)
        .lt('scheduled_at', endIso)
        .select('id');
      return { ids: (data ?? []).map((b) => b.id), error };
    }
  },
  {
    name: '2h',
    startHours: 1,
    endHours: 3,
    async claim(admin, nowIso, startIso, endIso) {
      const { data, error } = await admin
        .from('bookings')
        .update({ final_reminder_sent_at: nowIso })
        .eq('status', 'confirmed')
        .is('final_reminder_sent_at', null)
        .gte('scheduled_at', startIso)
        .lt('scheduled_at', endIso)
        .select('id');
      return { ids: (data ?? []).map((b) => b.id), error };
    }
  }
];

type RunResult = { window: WindowKind; claimed: number; failed: number };

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
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
    const { ids, error } = await w.claim(admin, nowIso, startIso, endIso);

    if (error) {
      console.error(`[cron/reminders] ${w.name} claim failed`, error);
      results.push({ window: w.name, claimed: 0, failed: 0 });
      continue;
    }

    const sendResults = await Promise.allSettled(ids.map((id) => notifyReminder(id, w.name)));
    const failed = sendResults.filter((r) => r.status === 'rejected').length;
    results.push({ window: w.name, claimed: ids.length, failed });
  }

  return NextResponse.json({ ok: true, runs: results });
}
