import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// The braid mark on the night surface — the iOS home-screen bookmark icon.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090414'
        }}
      >
        <svg width="112" height="112" viewBox="0 0 32 32" fill="none">
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
    { ...size }
  );
}
