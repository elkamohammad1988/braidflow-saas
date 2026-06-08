import { format } from 'date-fns';
import {
  DetailRow,
  Divider,
  EmailButton,
  EmailShell,
  H1,
  P,
  Signoff
} from '../components';
import { formatMoney } from '@/lib/utils';

export type ReceivedBraiderProps = {
  braiderFirstName: string;
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  scheduledAt: string;
  priceCents: number;
  depositCents: number;
  dashboardUrl: string;
};

export const receivedBraiderSubject = (p: ReceivedBraiderProps) =>
  `${p.clientName.split(' ')[0]} just booked ${p.serviceName}`;

export function BookingReceivedBraiderEmail(p: ReceivedBraiderProps) {
  const when = new Date(p.scheduledAt);
  return (
    <EmailShell preview={`New booking — ${format(when, 'EEE, MMM d, h:mm a')}`}>
      <H1>New booking.</H1>
      <P>
        Hi {p.braiderFirstName}, {p.clientName} just booked you for {format(when, "EEE, MMM d 'at' h:mm a")}. Their deposit is in.
      </P>

      <Divider />

      <DetailRow label="Client" value={p.clientName} />
      {p.clientPhone && <DetailRow label="Phone" value={p.clientPhone} />}
      <DetailRow label="Service" value={p.serviceName} />
      <DetailRow label="When" value={format(when, "EEE, MMM d 'at' h:mm a")} />
      <DetailRow label="Total" value={formatMoney(p.priceCents)} />
      <DetailRow label="Deposit collected" value={formatMoney(p.depositCents)} />
      <DetailRow
        label="Balance due at appointment"
        value={formatMoney(p.priceCents - p.depositCents)}
      />

      <Divider />

      <EmailButton href={p.dashboardUrl}>Open dashboard</EmailButton>
      <Signoff>— BraidFlow</Signoff>
    </EmailShell>
  );
}
