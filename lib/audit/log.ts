import 'server-only';
import { dbAdmin } from '@/lib/db/server';
import { createLogger, errorInfo } from '@/lib/log';
import type { Json } from '@/types/db';

const log = createLogger('audit');

export type AuditAction =
  | 'booking.created'
  | 'booking.rescheduled'
  | 'booking.cancelled'
  | 'booking.completed'
  | 'booking.no_show'
  | 'booking.refunded'
  | 'booking.expired'
  | 'payment.disputed'
  | 'settings.updated'
  | 'connect.account_created'
  | 'connect.onboarded';

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
    const admin = dbAdmin();
    const { error } = await admin.from('audit_logs').insert({
      actor_id: entry.actorId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      metadata: entry.metadata ?? {}
    });
    if (error) {
      log.error('failed to record', { action: entry.action, code: error.code });
    }
  } catch (err) {
    log.error('unexpected error recording', { action: entry.action, ...errorInfo(err) });
  }
}
