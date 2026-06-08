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
  const refund = list.find((p) => p.kind === 'refund');

  if (!deposit || deposit.status === 'pending') return 'deposit_pending';
  if (deposit.status !== 'succeeded') return 'no_deposit';

  if (!refund) return 'deposit_held';
  if (refund.status === 'failed') return 'refund_failed';
  if (refund.status === 'pending') return 'refund_pending';
  return 'refunded';
}

export const DEPOSIT_LABEL: Record<DepositState, string> = {
  no_deposit: 'No deposit',
  deposit_pending: 'Awaiting deposit',
  deposit_held: 'Deposit held',
  refund_pending: 'Refund pending',
  refunded: 'Deposit refunded',
  refund_failed: 'Refund failed'
};
