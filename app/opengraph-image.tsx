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
          backgroundColor: '#faf6f1',
          fontFamily: 'serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: '#1a1410',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#faf6f1',
              fontSize: 32,
              fontWeight: 600
            }}
          >
            B
          </div>
          <div style={{ fontSize: 32, color: '#1a1410', fontWeight: 500 }}>BraidFlow</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.05,
              color: '#1a1410',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              maxWidth: 980
            }}
          >
            Quit the DMs. Get paid up front.
          </div>
          <div style={{ fontSize: 30, color: '#6b5d52', maxWidth: 820 }}>
            The booking platform built for braiders. Deposits, scheduling, and reminders — done.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(26,20,16,0.12)',
            paddingTop: 24
          }}
        >
          <div style={{ fontSize: 22, color: '#6b5d52' }}>braidflow.app</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 22,
              color: '#c98b5e'
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                backgroundColor: '#c98b5e'
              }}
            />
            Start free
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
