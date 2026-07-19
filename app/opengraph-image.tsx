import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Whisper - encrypted LAN transfer and device collaboration'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// OG image in the site's blueprint style. English only — the default OG font
// has no CJK glyphs.
export default function OpengraphImage() {
  const signal = '#3b82f6'
  const line = '#1a2436'
  const muted = '#8696ac'
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#080c14',
          padding: 64,
          fontFamily: 'sans-serif',
        }}
      >
        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: '#e6edf5' }}>whisper</span>
            <span style={{ fontSize: 20, color: muted, letterSpacing: 6 }}>/ LAN</span>
          </div>
          <span style={{ fontSize: 18, color: muted, letterSpacing: 4 }}>PORT :10002</span>
        </div>

        {/* headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <span style={{ fontSize: 22, color: signal, letterSpacing: 8 }}>LAN · PEER-TO-PEER · END-TO-END ENCRYPTED</span>
          <span style={{ fontSize: 76, fontWeight: 700, color: '#e6edf5', lineHeight: 1.1, maxWidth: 900 }}>
            A direct local link for your devices.
          </span>
          <span style={{ fontSize: 28, color: muted, maxWidth: 880, lineHeight: 1.4 }}>
            Text, files, audio, and input move directly between trusted devices — no cloud relay.
          </span>
        </div>

        {/* footer chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${line}`, paddingTop: 32 }}>
          <div style={{ display: 'flex', gap: 28 }}>
            {['LAN-ONLY', 'NO CLOUD RELAY', 'E2E ENCRYPTED', '5 PLATFORMS', 'OPEN SOURCE · MIT'].map((s) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, color: muted, letterSpacing: 3 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: signal }} />
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
