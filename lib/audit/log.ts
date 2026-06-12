import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Json } from '@/types/db';

export type AuditAction =
  | 'booking.created'
  | 'booking.rescheduled'
  | 'booking.cancelled'
  | 'booking.refunded'
  | 'booking.expired'
  | 'settings.updated';

type AuditEntry = {
  actorId: string | null;
  action: AuditAction;
  entityType: 'booking' | 'braider';
  entityId: string | null;
  metadata?: Record<string, Json>;
};

// Append one row to the audit trail. Best-effort by design: a logging failure
// is swallowed (and logged to the server console) so it can never roll back or
// break the business action it's recording.
export async function recordAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const admin = supabaseAdmin();
    const { error } = await admin.from('audit_logs').insert({
      actor_id: entry.actorId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      metadata: entry.metadata ?? {}
    });
    if (error) {
      console.error('[audit] failed to record', entry.action, error);
    }
  } catch (err) {
    console.error('[audit] unexpected error recording', entry.action, err);
  }
}
