import { format } from 'date-fns';
import { DetailRow, Divider, EmailShell, H1, P, Signoff } from '../components';

export type RescheduledProps = {
  recipientFirstName: string;
  audience: 'client' | 'braider';
  otherPartyName: string;
  serviceName: string;
  previousScheduledAt: string;
  newScheduledAt: string;
};

export const rescheduledSubject = (p: RescheduledProps) => {
  const newDate = format(new Date(p.newScheduledAt), "MMM d 'at' h:mm a");
  return p.audience === 'client'
    ? `Your appointment moved to ${newDate}`
    : `${p.otherPartyName} moved their appointment`;
};

export function BookingRescheduledEmail(p: RescheduledProps) {
  const prev = new Date(p.previousScheduledAt);
  const next = new Date(p.newScheduledAt);

  return (
    <EmailShell preview={`Moved to ${format(next, "MMM d 'at' h:mm a")}`}>
      <H1>The appointment moved.</H1>
      <P>
        Hi {p.recipientFirstName},{' '}
        {p.audience === 'client'
          ? `your ${p.serviceName} appointment with ${p.otherPartyName} has a new time.`
          : `${p.otherPartyName} rescheduled their ${p.serviceName} appointment.`}
      </P>

      <Divider />

      <DetailRow label="Service" value={p.serviceName} />
      <DetailRow
        label={p.audience === 'client' ? 'Braider' : 'Client'}
        value={p.otherPartyName}
      />
      <DetailRow label="Was" value={format(prev, "EEE, MMM d 'at' h:mm a")} />
      <DetailRow label="Now" value={format(next, "EEE, MMM d 'at' h:mm a")} />

      <Divider />

      <P muted>
        Same service, same deposit — the deposit carries over automatically. We'll send a new
        reminder the day before.
      </P>

      <Signoff>— BraidFlow</Signoff>
    </EmailShell>
  );
}
