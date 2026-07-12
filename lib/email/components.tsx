import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components';
import type { ReactNode } from 'react';

// Transactional emails stay on a light background for deliverability and cross-
// client compatibility, but carry the app's violet brand — a cool near-neutral
// palette with the signature violet accent on the wordmark and CTA. (The old
// warm-brown/gold identity and Georgia serif were retired in the purple redesign;
// Inter isn't loadable in email, so display type is the system sans set apart by
// weight, mirroring the in-app Inter decision.)
const colors = {
  ink: '#1b1235',
  inkMuted: '#635d78',
  cream: '#f5f4fa',
  card: '#ffffff',
  border: 'rgba(27,18,53,0.09)',
  accent: '#6d28d9'
};

const sansStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const fonts = {
  sans: sansStack,
  display: sansStack
};

export function EmailShell({
  preview,
  children
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: colors.cream,
          color: colors.ink,
          fontFamily: fonts.sans,
          margin: 0,
          padding: '40px 16px'
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: '0 auto'
          }}
        >
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: colors.accent,
              margin: '0 0 24px 4px'
            }}
          >
            BraidFlow
          </Text>

          <Section
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              padding: '32px 32px 28px',
              boxShadow: '0 8px 24px -12px rgba(27,18,53,0.12)'
            }}
          >
            {children}
          </Section>

          <Section style={{ padding: '24px 8px 0' }}>
            <Text style={{ fontSize: 12, color: colors.inkMuted, margin: 0, lineHeight: 1.6 }}>
              You're receiving this because you have an account on BraidFlow.
              Questions? Just reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function H1({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: fonts.display,
        fontSize: 28,
        fontWeight: 600,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        color: colors.ink,
        margin: '0 0 12px'
      }}
    >
      {children}
    </Text>
  );
}

export function P({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <Text
      style={{
        fontSize: 15,
        lineHeight: 1.6,
        color: muted ? colors.inkMuted : colors.ink,
        margin: '0 0 12px'
      }}
    >
      {children}
    </Text>
  );
}

export function Divider() {
  return <Hr style={{ borderColor: colors.border, margin: '20px 0' }} />;
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <table cellPadding={0} cellSpacing={0} style={{ width: '100%', marginBottom: 6 }}>
      <tr>
        <td style={{ fontSize: 13, color: colors.inkMuted, padding: '2px 0' }}>{label}</td>
        <td
          style={{
            fontSize: 14,
            color: colors.ink,
            padding: '2px 0',
            textAlign: 'right',
            fontWeight: 500
          }}
        >
          {value}
        </td>
      </tr>
    </table>
  );
}

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <table cellPadding={0} cellSpacing={0} style={{ margin: '4px 0 12px' }}>
      <tr>
        <td
          style={{
            backgroundColor: colors.accent,
            borderRadius: 999
          }}
        >
          <a
            href={href}
            style={{
              display: 'inline-block',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              padding: '11px 22px',
              textDecoration: 'none'
            }}
          >
            {children}
          </a>
        </td>
      </tr>
    </table>
  );
}

export function Signoff({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 14,
        color: colors.inkMuted,
        margin: '20px 0 0',
        lineHeight: 1.6
      }}
    >
      {children}
    </Text>
  );
}
