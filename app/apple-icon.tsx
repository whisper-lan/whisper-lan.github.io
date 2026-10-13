import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Matches the app icon: a gradient ring around the wordmark.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', position: 'relative' }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2a8fe0" />
              <stop offset="0.5" stopColor="#3bb3a4" />
              <stop offset="1" stopColor="#8fd443" />
            </linearGradient>
          </defs>
          <circle cx="90" cy="90" r="70" fill="none" stroke="url(#g)" strokeWidth="3" />
        </svg>
        <span style={{ fontSize: 30, color: '#b9bcc1', letterSpacing: 2 }}>whisper</span>
      </div>
    ),
    {
      ...size,
    }
  )
}
