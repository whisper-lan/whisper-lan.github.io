import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

// Social card in the site's style: the ring on black, served as /og.png (see
// OG_IMAGE in lib/seo.ts). English only — the default OG font has no CJK glyphs.
export function GET() {
  const ink = '#f2f3f5'
  const muted = '#8a8f98'
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#000000', fontFamily: 'sans-serif', overflow: 'hidden' }}>
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2a8fe0" />
              <stop offset="0.5" stopColor="#3bb3a4" />
              <stop offset="1" stopColor="#8fd443" />
            </linearGradient>
            <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.7" stopColor="#3bb3a4" stopOpacity="0" />
              <stop offset="0.93" stopColor="#3bb3a4" stopOpacity="0.28" />
              <stop offset="1" stopColor="#3bb3a4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="1010" cy="315" r="300" fill="url(#glow)" />
          <circle cx="1010" cy="315" r="330" fill="none" stroke="url(#g)" strokeWidth="1" opacity="0.25" />
          <circle cx="1010" cy="315" r="280" fill="none" stroke="url(#g)" strokeWidth="2.5" />
          <circle cx="812" cy="117" r="9" fill="#ffffff" stroke="#9fe8ff" strokeWidth="3" />
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width="34" height="34" viewBox="0 0 32 32">
              <defs>
                <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#2a8fe0" />
                  <stop offset="1" stopColor="#8fd443" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="13" fill="none" stroke="url(#m)" strokeWidth="3.4" />
            </svg>
            <span style={{ fontSize: 34, fontWeight: 600, color: ink }}>Whisper</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 64, lineHeight: 1.08, letterSpacing: -1.5 }}>
              <span style={{ color: ink }}>Whisper over LAN.</span>
              <span style={{ color: '#6f747d' }}>Just between your devices.</span>
            </div>
            <span style={{ fontSize: 26, color: muted, maxWidth: 600, lineHeight: 1.45 }}>
              Files, clipboard, sound, and input between your own devices — encrypted end to end over the local network.
            </span>
          </div>

          <span style={{ fontSize: 20, color: muted, letterSpacing: 1 }}>Android · macOS · Windows · Linux · Free & open source</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
