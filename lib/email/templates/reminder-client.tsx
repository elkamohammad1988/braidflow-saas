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

export type ReminderClientProps = {
  clientFirstName: string;
  businessName: string;
  serviceName: string;
  scheduledAt: string;
  balanceCents: number;
  bookingUrl: string;
  proximity?: '24h' | '2h';
};

export const reminderClientSubject = (p: ReminderClientProps) =>
  p.proximity === '2h'
    ? `Heads up — ${p.businessName} in a couple hours`
    : `Tomorrow with ${p.businessName}`;

export function ReminderClientEmail(p: ReminderClientProps) {
  const when = new Date(p.scheduledAt);
  const isSoon = p.proximity === '2h';
  return (
    <EmailShell preview={isSoon ? `Today at ${format(when, 'h:mm a')}` : `Tomorrow at ${format(when, 'h:mm a')}`}>
      <H1>{isSoon ? 'See you soon.' : "Tomorrow's the day."}</H1>
      <P>
        Hi {p.clientFirstName},{' '}
        {isSoon
          ? `you're up with ${p.businessName} in about two hours.`
          : `quick heads up — you're booked with ${p.businessName} tomorrow.`}
      </P>

      <Divider />

      <DetailRow label="Service" value={p.serviceName} />
      <DetailRow label="When" value={format(when, "EEE, MMM d 'at' h:mm a")} />
      <DetailRow label="Balance" value={formatMoney(p.balanceCents)} />

      <Divider />

      <P muted>
        Bring the balance in cash or pay by card at the chair. If something's changed, get in touch
        with {p.businessName} directly.
      </P>

      <EmailButton href={p.bookingUrl}>View booking</EmailButton>
      <Signoff>See you then.</Signoff>
    </EmailShell>
  );
}
