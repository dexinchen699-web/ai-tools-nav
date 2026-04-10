import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Static export for Vercel/Cloudflare Pages
  output: 'standalone',

  // Image optimization: WebP/AVIF auto-conversion
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.google.com' },
    ],
  },

  // HTTP headers: security + caching + Core Web Vitals
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Long-term cache for static assets
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache HTML pages for 1 hour, allow stale-while-revalidate
        source: '/((?!api|_next/static|_next/image|favicon).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },

  // Redirects for SEO-safe URL normalization
  async redirects() {
    return [
      // Trailing slash normalization
      {
        source: '/tools/:slug/',
        destination: '/tools/:slug',
        permanent: true,
      },
      {
        source: '/category/:cat/',
        destination: '/category/:cat',
        permanent: true,
      },
    ]
  },

  // Compress responses
  compress: true,

  // Power by header removal
  poweredByHeader: false,

  // Experimental: partial prerendering for CWV
  experimental: {
    ppr: false, // enable when stable
  },
}

export default nextConfig
