import { ImageResponse } from 'next/og'

// 路由段配置
export const runtime = 'edge'

// 图片元数据
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// 图片生成函数
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 110,
          background: '#2563eb',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '40px',
          fontWeight: 700,
        }}
      >
        W
      </div>
    ),
    {
      ...size,
    }
  )
}
