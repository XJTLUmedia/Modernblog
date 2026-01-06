import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Content Security Policy
  async headers() {
    return [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https:*.z.ai wss://*.z.ai",
          "media-src 'self' blob: https:",
          "worker-src 'self' blob:",
          "frame-src 'none'",
          "form-action 'self'",
          "base-uri 'self'",
          "manifest-src 'self'",
        ].join('; ')
      }
    ]
  }
}

export default nextConfig
