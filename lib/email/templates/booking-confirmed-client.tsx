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

export type ConfirmedClientProps = {
  clientFirstName: string;
  businessName: string;
  serviceName: string;
  scheduledAt: string;
  timeZone: string;
  priceCents: number;
  depositCents: number;
  bookingUrl: string;
};

export const confirmedClientSubject = (p: ConfirmedClientProps) =>
  `You're booked with ${p.businessName}`;

export function BookingConfirmedClientEmail(p: ConfirmedClientProps) {
  const whenLabel = `${formatInZone(p.scheduledAt, p.timeZone, "EEE, MMM d 'at' h:mm a")} ${zoneAbbreviation(
    p.scheduledAt,
    p.timeZone
  )}`;
  return (
    <EmailShell
      preview={`${p.serviceName} on ${formatInZone(p.scheduledAt, p.timeZone, 'MMM d')} — confirmed`}
    >
      <H1>You're on the books.</H1>
      <P>
        Hey {p.clientFirstName}, your appointment with {p.businessName} is locked in. The deposit
        went through and the slot is yours.
      </P>

      <Divider />

      <DetailRow label="Service" value={p.serviceName} />
      <DetailRow label="When" value={whenLabel} />
      <DetailRow label="Braider" value={p.businessName} />
      <DetailRow label="Deposit paid" value={formatMoney(p.depositCents)} />
      <DetailRow
        label="Balance at appointment"
        value={formatMoney(p.priceCents - p.depositCents)}
      />

      <Divider />

      <P muted>We'll send a reminder the day before. If something comes up, you can cancel or reschedule from your bookings page.</P>

      <EmailButton href={p.bookingUrl}>View booking</EmailButton>

      <Signoff>See you then.</Signoff>
    </EmailShell>
  );
}
