import { DetailRow, Divider, EmailShell, H1, P, Signoff } from '../components';
import { formatInZone, zoneAbbreviation } from '@/lib/format-date';

export type RescheduledProps = {
  recipientFirstName: string;
  audience: 'client' | 'braider';
  otherPartyName: string;
  serviceName: string;
  previousScheduledAt: string;
  newScheduledAt: string;
  timeZone: string;
};

export const rescheduledSubject = (p: RescheduledProps) => {
  const newDate = formatInZone(p.newScheduledAt, p.timeZone, "MMM d 'at' h:mm a");
  return p.audience === 'client'
    ? `Your appointment moved to ${newDate}`
    : `${p.otherPartyName} moved their appointment`;
};

export function BookingRescheduledEmail(p: RescheduledProps) {
  const abbr = zoneAbbreviation(p.newScheduledAt, p.timeZone);
  const wasLabel = `${formatInZone(p.previousScheduledAt, p.timeZone, "EEE, MMM d 'at' h:mm a")} ${zoneAbbreviation(
    p.previousScheduledAt,
    p.timeZone
  )}`;
  const nowLabel = `${formatInZone(p.newScheduledAt, p.timeZone, "EEE, MMM d 'at' h:mm a")} ${abbr}`;

  return (
    <EmailShell
      preview={`Moved to ${formatInZone(p.newScheduledAt, p.timeZone, "MMM d 'at' h:mm a")}`}
    >
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
      <DetailRow label="Was" value={wasLabel} />
      <DetailRow label="Now" value={nowLabel} />

      <Divider />

      <P muted>
        Same service, same deposit — the deposit carries over automatically. We'll send a new
        reminder the day before.
      </P>

      <Signoff>— BraidFlow</Signoff>
    </EmailShell>
  );
}
