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

export type ReminderBraiderProps = {
  braiderFirstName: string;
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  scheduledAt: string;
  dashboardUrl: string;
  proximity?: '24h' | '2h';
};

export const reminderBraiderSubject = (p: ReminderBraiderProps) =>
  p.proximity === '2h'
    ? `Soon: ${p.clientName.split(' ')[0]} for ${p.serviceName}`
    : `Tomorrow: ${p.clientName.split(' ')[0]} for ${p.serviceName}`;

export function ReminderBraiderEmail(p: ReminderBraiderProps) {
  const when = new Date(p.scheduledAt);
  const isSoon = p.proximity === '2h';
  return (
    <EmailShell preview={isSoon ? `${p.clientName} soon at ${format(when, 'h:mm a')}` : `${p.clientName} tomorrow at ${format(when, 'h:mm a')}`}>
      <H1>{isSoon ? 'Up next.' : "Tomorrow's lineup."}</H1>
      <P>
        Hi {p.braiderFirstName}, {p.clientName} is{' '}
        {isSoon ? 'coming in shortly.' : 'coming in tomorrow.'}
      </P>

      <Divider />

      <DetailRow label="Client" value={p.clientName} />
      {p.clientPhone && <DetailRow label="Phone" value={p.clientPhone} />}
      <DetailRow label="Service" value={p.serviceName} />
      <DetailRow label="When" value={format(when, "EEE, MMM d 'at' h:mm a")} />

      <Divider />

      <EmailButton href={p.dashboardUrl}>Open dashboard</EmailButton>
      <Signoff>— BraidFlow</Signoff>
    </EmailShell>
  );
}
