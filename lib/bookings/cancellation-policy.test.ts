import { describe, it, expect } from 'vitest';
import { decideDepositRefund } from './cancellation-policy';

// Appointment fixed at 2026-06-20 15:00 UTC. The 48h cutoff is 2026-06-18 15:00 UTC.
const scheduledAt = new Date('2026-06-20T15:00:00Z');

describe('decideDepositRefund (48h policy)', () => {
  it('always refunds when the braider cancels, even at the last minute', () => {
    const d = decideDepositRefund({
      cancelledBy: 'braider',
      scheduledAt,
      now: new Date('2026-06-20T14:00:00Z') // 1h before
    });
    expect(d.refund).toBe(true);
    expect(d.reason).toBe('braider_cancelled');
  });

  it('refunds a client cancel made more than 48h before', () => {
    const d = decideDepositRefund({
      cancelledBy: 'client',
      scheduledAt,
      now: new Date('2026-06-18T10:00:00Z') // ~53h before
    });
    expect(d.refund).toBe(true);
    expect(d.reason).toBe('outside_window');
  });

  it('forfeits a client cancel made within 48h', () => {
    const d = decideDepositRefund({
      cancelledBy: 'client',
      scheduledAt,
      now: new Date('2026-06-19T12:00:00Z') // 27h before
    });
    expect(d.refund).toBe(false);
    expect(d.reason).toBe('within_window');
  });

  it('treats exactly 48h before as still refundable (boundary)', () => {
    const d = decideDepositRefund({
      cancelledBy: 'client',
      scheduledAt,
      now: new Date('2026-06-18T15:00:00Z') // exactly 48h
    });
    expect(d.refund).toBe(true);
    expect(d.reason).toBe('outside_window');
  });

  it('forfeits one minute inside the window', () => {
    const d = decideDepositRefund({
      cancelledBy: 'client',
      scheduledAt,
      now: new Date('2026-06-18T15:01:00Z') // 47h59m before
    });
    expect(d.refund).toBe(false);
  });
});
