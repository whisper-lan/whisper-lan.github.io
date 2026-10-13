import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// The app icon's ring, reduced to the mark.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2a8fe0" />
              <stop offset="0.5" stopColor="#3bb3a4" />
              <stop offset="1" stopColor="#8fd443" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="12.6" fill="none" stroke="url(#g)" strokeWidth="3.6" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
