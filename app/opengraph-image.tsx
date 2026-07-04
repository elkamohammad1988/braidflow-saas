import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BraidFlow — booking for braiders';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          backgroundColor: '#140d08',
          backgroundImage:
            'radial-gradient(60% 80% at 12% 0%, rgba(224,163,63,0.30), transparent 60%), radial-gradient(60% 80% at 100% 30%, rgba(106,47,82,0.45), transparent 60%)',
          fontFamily: 'serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #271b12, #140d08)',
              border: '1px solid rgba(224,163,63,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e0a33f',
              fontSize: 34,
              fontWeight: 600
            }}
          >
            B
          </div>
          <div style={{ fontSize: 34, color: '#f5eee3', fontWeight: 500 }}>
            Braid<span style={{ color: '#e0a33f' }}>flow</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 94,
              lineHeight: 1.02,
              color: '#f5eee3',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              maxWidth: 1000
            }}
          >
            Quit the DMs. Get paid&nbsp;
            <span style={{ color: '#e0a33f', fontStyle: 'italic' }}>up front.</span>
          </div>
          <div style={{ fontSize: 30, color: 'rgba(245,238,227,0.65)', maxWidth: 840 }}>
            The booking platform built for braiders. Deposits, scheduling, and reminders — done.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(245,238,227,0.14)',
            paddingTop: 26
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: 'rgba(245,238,227,0.55)',
              fontFamily: 'monospace',
              letterSpacing: '0.08em'
            }}
          >
            braidflow.app
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 22,
              color: '#e0a33f'
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#e0a33f' }} />
            Start free
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
