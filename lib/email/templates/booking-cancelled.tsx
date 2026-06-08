import { format } from 'date-fns';
import { DetailRow, Divider, EmailShell, H1, P, Signoff } from '../components';

export type CancelledProps = {
  recipientFirstName: string;
  audience: 'client' | 'braider';
  cancelledBy: 'client' | 'braider';
  otherPartyName: string;
  serviceName: string;
  scheduledAt: string;
};

export const cancelledSubject = (p: CancelledProps) =>
  p.audience === 'client'
    ? `Your appointment with ${p.otherPartyName} was cancelled`
    : `${p.otherPartyName} cancelled their appointment`;

export function BookingCancelledEmail(p: CancelledProps) {
  const when = new Date(p.scheduledAt);
  const headline =
    p.audience === 'client' ? 'Your appointment is off.' : 'A booking was cancelled.';

  return (
    <EmailShell preview={`Cancelled: ${p.serviceName} on ${format(when, 'MMM d')}`}>
      <H1>{headline}</H1>

      {p.audience === 'client' ? (
        <P>
          Hi {p.recipientFirstName}, {p.otherPartyName} cancelled your {p.serviceName} appointment on{' '}
          {format(when, "EEE, MMM d 'at' h:mm a")}.
        </P>
      ) : p.cancelledBy === 'client' ? (
        <P>
          Hi {p.recipientFirstName}, {p.otherPartyName} cancelled their {p.serviceName} appointment on{' '}
          {format(when, "EEE, MMM d 'at' h:mm a")}. The slot is open again.
        </P>
      ) : (
        <P>
          Hi {p.recipientFirstName}, we've cancelled the {p.serviceName} appointment with {p.otherPartyName} on{' '}
          {format(when, "EEE, MMM d 'at' h:mm a")} on your behalf.
        </P>
      )}

      <Divider />
      <DetailRow label="Service" value={p.serviceName} />
      <DetailRow label="When" value={format(when, "EEE, MMM d 'at' h:mm a")} />
      <DetailRow
        label={p.audience === 'client' ? 'Braider' : 'Client'}
        value={p.otherPartyName}
      />
      <Divider />

      {p.audience === 'client' && (
        <P muted>
          Your deposit is held per {p.otherPartyName}'s cancellation policy. If you have questions about a refund,
          reach out to {p.otherPartyName} directly — they'll have the latest on their policy.
        </P>
      )}

      <Signoff>— BraidFlow</Signoff>
    </EmailShell>
  );
}
