import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Kavion — Personal Command Center for Founders & Builders'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#07070F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top purple glow */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: '50%',
            width: 900,
            height: 600,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 65%)',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
          }}
        />

        {/* Bottom cyan glow */}
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            background: 'radial-gradient(ellipse, rgba(0,196,245,0.10) 0%, transparent 65%)',
            borderRadius: '50%',
          }}
        />

        {/* Icon */}
        <div
          style={{
            width: 100,
            height: 100,
            background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            borderRadius: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            boxShadow: '0 0 80px rgba(124,58,237,0.55)',
          }}
        >
          <span style={{ color: '#fff', fontSize: 56, fontWeight: 900, letterSpacing: -2 }}>K</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#F0F4FF',
            letterSpacing: -3,
            marginBottom: 14,
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          Kavion
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: 'rgba(240,244,255,0.55)',
            textAlign: 'center',
            maxWidth: 680,
            lineHeight: 1.45,
            marginBottom: 44,
          }}
        >
          Personal Command Center for Founders &amp; Builders
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 10 }}>
          {['Projects', 'Revenue', 'Habits', 'Ideas', 'Servers', 'YouTube'].map((f) => (
            <div
              key={f}
              style={{
                padding: '9px 20px',
                borderRadius: 99,
                background: 'rgba(124,58,237,0.14)',
                border: '1px solid rgba(124,58,237,0.32)',
                color: '#A78BFA',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            color: 'rgba(240,244,255,0.2)',
            fontSize: 17,
            letterSpacing: 2,
          }}
        >
          kavion.app
        </div>
      </div>
    ),
    { ...size }
  )
}
