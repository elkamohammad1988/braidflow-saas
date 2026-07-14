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
import { formatInZone, zoneAbbreviation } from '@/lib/format-date';

export type ReceivedBraiderProps = {
  braiderFirstName: string;
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  scheduledAt: string;
  timeZone: string;
  priceCents: number;
  depositCents: number;
  dashboardUrl: string;
};

export const receivedBraiderSubject = (p: ReceivedBraiderProps) =>
  `${p.clientName.split(' ')[0]} just booked ${p.serviceName}`;

export function BookingReceivedBraiderEmail(p: ReceivedBraiderProps) {
  const whenLabel = `${formatInZone(p.scheduledAt, p.timeZone, "EEE, MMM d 'at' h:mm a", 'en')} ${zoneAbbreviation(
    p.scheduledAt,
    p.timeZone
  )}`;
  return (
    <EmailShell
      preview={`New booking — ${formatInZone(p.scheduledAt, p.timeZone, 'EEE, MMM d, h:mm a', 'en')}`}
    >
      <H1>New booking.</H1>
      <P>
        Hi {p.braiderFirstName}, {p.clientName} just booked you for {whenLabel}. Their deposit is in.
      </P>

      <Divider />

      <DetailRow label="Client" value={p.clientName} />
      {p.clientPhone && <DetailRow label="Phone" value={p.clientPhone} />}
      <DetailRow label="Service" value={p.serviceName} />
      <DetailRow label="When" value={whenLabel} />
      <DetailRow label="Total" value={formatMoney(p.priceCents, 'en')} />
      <DetailRow label="Deposit collected" value={formatMoney(p.depositCents, 'en')} />
      <DetailRow
        label="Balance due at appointment"
        value={formatMoney(p.priceCents - p.depositCents, 'en')}
      />

      <Divider />

      <EmailButton href={p.dashboardUrl}>Open dashboard</EmailButton>
      <Signoff>— BraidFlow</Signoff>
    </EmailShell>
  );
}
