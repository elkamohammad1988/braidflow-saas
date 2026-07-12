import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// A 512×512 MASKABLE PWA icon: solid night field edge-to-edge with the braid
// mark held inside the central ~40–60% safe zone, so adaptive Android launchers
// can crop it to any shape (circle, squircle, rounded-square) without clipping
// the glyph. Referenced from app/manifest.ts with purpose "maskable". Served as
// PNG at /maskable-icon.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#07030F'
        }}
      >
        <svg width="300" height="300" viewBox="0 0 32 32" fill="none">
          <path
            d="M11 8 C 17 8, 22 11, 22 14.5 C 22 17, 19 18, 16 18 M11 24 C 17 24, 22 21, 22 17.5 C 22 15, 19 14, 16 14 M11 8 L 11 24"
            stroke="#8B5CF6"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="22" cy="9" r="1.6" fill="#C4B5FD" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
