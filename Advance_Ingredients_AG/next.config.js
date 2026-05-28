/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Prevent clickjacking: disallow embedding this site in any iframe
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't send referrer URL to external sites
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // XSS protection (legacy browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // DNS prefetching control
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Permissions policy (formerly Feature-Policy)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  // Content Security Policy (basic version, adjust based on your needs)
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  },
  // Only allow HTTPS (enable after confirming SSL is configured)
  // { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
