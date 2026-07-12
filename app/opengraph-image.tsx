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
          backgroundColor: '#07030F',
          backgroundImage:
            'radial-gradient(60% 80% at 12% 0%, rgba(139,92,246,0.30), transparent 60%), radial-gradient(60% 80% at 100% 30%, rgba(91,33,182,0.45), transparent 60%)',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #241C3D, #090414)',
              border: '1px solid rgba(139,92,246,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8B5CF6',
              fontSize: 34,
              fontWeight: 600
            }}
          >
            B
          </div>
          {/* Satori requires explicit display:flex on any element with more than
              one child (here the "Braid" text node + the "flow" span). */}
          <div style={{ display: 'flex', fontSize: 34, color: '#FFFFFF', fontWeight: 500 }}>
            Braid<span style={{ color: '#8B5CF6' }}>flow</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div
            style={{
              display: 'flex',
              // Wrap so the headline breaks across lines instead of overflowing
              // the 1200px canvas (Satori lays flex children out in a row and
              // won't wrap without this).
              flexWrap: 'wrap',
              fontSize: 88,
              lineHeight: 1.04,
              color: '#FFFFFF',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              maxWidth: 1040
            }}
          >
            Quit the DMs. Get paid&nbsp;
            <span style={{ color: '#8B5CF6', fontStyle: 'italic' }}>up front.</span>
          </div>
          <div style={{ fontSize: 30, color: 'rgba(214,208,245,0.72)', maxWidth: 840 }}>
            The booking platform built for braiders. Deposits, scheduling, and reminders — done.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(139,92,246,0.24)',
            paddingTop: 26
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: 'rgba(168,156,207,0.75)',
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
              color: '#8B5CF6'
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#8B5CF6' }} />
            Start free
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
