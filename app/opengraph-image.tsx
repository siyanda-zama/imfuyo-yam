import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HerdGuard — Smart Livestock Protection';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A1628',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00C896, #3B82F6, #00C896)',
          }}
        />

        {/* Shield icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            backgroundColor: 'rgba(0, 200, 150, 0.15)',
            border: '2px solid rgba(0, 200, 150, 0.3)',
            marginBottom: '24px',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: '8px',
            letterSpacing: '-1px',
          }}
        >
          HerdGuard
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#00C896',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          Smart Livestock Protection
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '18px',
            color: '#8B95A5',
            maxWidth: '600px',
            textAlign: 'center',
            lineHeight: '1.5',
          }}
        >
          GPS livestock tracking and protection for South African farmers
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#4A5568',
            fontSize: '14px',
          }}
        >
          <span>herd-guard.vercel.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
