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

const colors = {
  ink: '#1a1410',
  inkMuted: '#6b5d52',
  cream: '#faf6f1',
  card: '#ffffff',
  border: 'rgba(26,20,16,0.06)',
  clay: '#c98b5e'
};

const fonts = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  display: 'Georgia, "Times New Roman", serif'
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
              letterSpacing: '-0.01em',
              color: colors.ink,
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
              boxShadow: '0 8px 24px -12px rgba(26,20,16,0.10)'
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
        lineHeight: 1.15,
        letterSpacing: '-0.01em',
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
            backgroundColor: colors.ink,
            borderRadius: 999
          }}
        >
          <a
            href={href}
            style={{
              display: 'inline-block',
              color: colors.cream,
              fontSize: 14,
              fontWeight: 500,
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
