import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data:",
              "style-src 'self' 'unsafe-inline' blob: data:",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: blob:",
              "connect-src 'self' https: http: ws: wss: blob: data:",
              "media-src 'self' blob: https: data:",
              "worker-src 'self' blob: data:",
              "frame-src 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "manifest-src 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ]
  },

  reactStrictMode: false,

  async redirects() {
    return [
      {
        source: "/projects",
        destination: "/forge",
        permanent: true,
      },
      {
        source: "/projects/:slug",
        destination: "/forge/:slug",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
