import { describe, it, expect } from 'vitest';
import { depositStateFromPayments } from './status';

// The deposit badge derives from the payment rows. These lock the state machine,
// including the tie-break when a booking carries more than one refund row.

describe('depositStateFromPayments', () => {
  it('reports awaiting deposit when there is no deposit or it is pending', () => {
    expect(depositStateFromPayments([])).toBe('deposit_pending');
    expect(depositStateFromPayments([{ kind: 'deposit', status: 'pending' }])).toBe('deposit_pending');
  });

  it('reports held once the deposit has succeeded with no refund', () => {
    expect(depositStateFromPayments([{ kind: 'deposit', status: 'succeeded' }])).toBe('deposit_held');
  });

  it('reports refunded when a succeeded refund exists', () => {
    expect(
      depositStateFromPayments([
        { kind: 'deposit', status: 'succeeded' },
        { kind: 'refund', status: 'succeeded' }
      ])
    ).toBe('refunded');
  });

  it('reflects a successful retry over an earlier failed refund (not first-match)', () => {
    // A failed attempt followed by a successful one — the badge must show the
    // final outcome regardless of row order.
    expect(
      depositStateFromPayments([
        { kind: 'deposit', status: 'succeeded' },
        { kind: 'refund', status: 'failed' },
        { kind: 'refund', status: 'succeeded' }
      ])
    ).toBe('refunded');
  });

  it('shows refund failed only when every refund row is failed', () => {
    expect(
      depositStateFromPayments([
        { kind: 'deposit', status: 'succeeded' },
        { kind: 'refund', status: 'failed' }
      ])
    ).toBe('refund_failed');
  });

  it('prefers a pending refund over a failed one', () => {
    expect(
      depositStateFromPayments([
        { kind: 'deposit', status: 'succeeded' },
        { kind: 'refund', status: 'failed' },
        { kind: 'refund', status: 'pending' }
      ])
    ).toBe('refund_pending');
  });
});
