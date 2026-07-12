export type DepositState =
  | 'no_deposit'
  | 'deposit_pending'
  | 'deposit_held'
  | 'refund_pending'
  | 'refunded'
  | 'refund_failed';

type PaymentRow = {
  kind: 'deposit' | 'balance' | 'refund';
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
};

export function depositStateFromPayments(payments: PaymentRow[] | null | undefined): DepositState {
  const list = payments ?? [];
  const deposit = list.find((p) => p.kind === 'deposit');
  // A booking can carry more than one refund row — a failed attempt followed by a
  // successful retry. Reflect the FINAL outcome, not whichever row is first:
  // prefer a settled refund, then a pending one, else the (failed) remainder.
  const refunds = list.filter((p) => p.kind === 'refund');
  const refund =
    refunds.find((r) => r.status === 'succeeded' || r.status === 'refunded') ??
    refunds.find((r) => r.status === 'pending') ??
    refunds[0];

  if (!deposit || deposit.status === 'pending') return 'deposit_pending';
  if (deposit.status !== 'succeeded') return 'no_deposit';

  if (!refund) return 'deposit_held';
  if (refund.status === 'failed') return 'refund_failed';
  if (refund.status === 'pending') return 'refund_pending';
  return 'refunded';
}

// i18n key per deposit state, under the shared `deposit` message namespace.
// Badges render these through next-intl so every deposit state localizes.
export const DEPOSIT_LABEL_KEY: Record<DepositState, string> = {
  no_deposit: 'depositNone',
  deposit_pending: 'depositPending',
  deposit_held: 'depositHeld',
  refund_pending: 'depositRefundPending',
  refunded: 'depositRefunded',
  refund_failed: 'depositRefundFailed'
};
