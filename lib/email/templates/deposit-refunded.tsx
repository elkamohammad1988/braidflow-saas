import {
  DetailRow,
  Divider,
  EmailShell,
  H1,
  P,
  Signoff
} from '../components';
import { formatMoney } from '@/lib/utils';

export type RefundedProps = {
  clientFirstName: string;
  businessName: string;
  serviceName: string;
  amountCents: number;
};

export const refundedSubject = (p: RefundedProps) =>
  `Your deposit refund is on the way`;

export function DepositRefundedEmail(p: RefundedProps) {
  return (
    <EmailShell preview={`${formatMoney(p.amountCents)} refund from ${p.businessName}`}>
      <H1>Your refund is on the way.</H1>
      <P>
        Hi {p.clientFirstName}, {p.businessName} just refunded the deposit for your{' '}
        {p.serviceName} appointment.
      </P>

      <Divider />

      <DetailRow label="Service" value={p.serviceName} />
      <DetailRow label="From" value={p.businessName} />
      <DetailRow label="Refund amount" value={formatMoney(p.amountCents)} />

      <Divider />

      <P muted>
        Refunds usually land in 5–10 business days, on the same card you used to pay. If you don't
        see it within two weeks, get in touch and we'll chase it.
      </P>

      <Signoff>— BraidFlow</Signoff>
    </EmailShell>
  );
}
