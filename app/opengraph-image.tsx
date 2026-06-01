import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Aegis — BNPL Credit Score Shield';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #000000, #111111)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
            top: '-200px',
            right: '-200px',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '60px',
            backgroundColor: 'rgba(10,10,10,0.8)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <span
              style={{
                fontSize: '48px',
                fontWeight: 800,
                letterSpacing: '-0.05em',
              }}
            >
              Aegis.
            </span>
          </div>
          
          <div
            style={{
              fontSize: '72px',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '24px',
              maxWidth: '800px',
            }}
          >
            Your Klarna payments now affect your credit score.
          </div>
          
          <div
            style={{
              fontSize: '32px',
              color: '#a1a1aa',
              marginBottom: '64px',
              maxWidth: '700px',
            }}
          >
            We make sure they don&apos;t damage it.
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'monospace',
              fontSize: '24px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#ef4444',
            }}
          >
            [ FICO 10 Protection Active ]
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
