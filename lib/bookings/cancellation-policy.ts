import { CANCELLATION_REFUND_WINDOW_HOURS } from '@/lib/constants';

export type RefundReason =
  | 'braider_cancelled' // braider cancelled → always refund the client
  | 'outside_window' // client cancelled with enough notice → refund
  | 'within_window'; // client cancelled too close to the appointment → forfeit

export type RefundDecision = {
  refund: boolean;
  reason: RefundReason;
  windowHours: number;
};

/**
 * Decide whether a cancelled booking's charged deposit should be refunded.
 *
 * Policy (owner-set): a client gets a full refund only if they cancel at least
 * `CANCELLATION_REFUND_WINDOW_HOURS` before the appointment; cancelling later
 * forfeits the deposit (its no-show-deterrent purpose). A braider-initiated
 * cancellation always refunds the client — the client did nothing wrong.
 *
 * Pure function (no I/O) so it is trivially unit-testable and the policy lives
 * in exactly one place.
 */
export function decideDepositRefund(params: {
  cancelledBy: 'client' | 'braider';
  scheduledAt: Date;
  now: Date;
}): RefundDecision {
  const windowHours = CANCELLATION_REFUND_WINDOW_HOURS;

  if (params.cancelledBy === 'braider') {
    return { refund: true, reason: 'braider_cancelled', windowHours };
  }

  const windowMs = windowHours * 60 * 60 * 1000;
  const cutoff = params.scheduledAt.getTime() - windowMs;
  const refund = params.now.getTime() <= cutoff;

  return {
    refund,
    reason: refund ? 'outside_window' : 'within_window',
    windowHours
  };
}
