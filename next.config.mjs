import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Conservative security headers applied to every response. Deliberately no
// strict CSP here — Stripe Elements + Next's inline runtime need a carefully
// scoped policy, and a wrong CSP silently breaks checkout; these headers are the
// high-value, low-risk subset.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }]
  },
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
    // Required on Next 14 so instrumentation.ts (which boots Sentry on the
    // server/edge runtimes) is loaded.
    instrumentationHook: true
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  }
};

// Wrap with Sentry. This is safe with no Sentry env configured: source-map
// upload is skipped without SENTRY_AUTH_TOKEN, and the runtime SDK stays inert
// without a DSN. `silent` keeps the build log clean when nothing is set.
export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Upload a wider set of client source maps for readable stack traces.
  widenClientFileUpload: true,
  // Strip the Sentry SDK's own debug logging from the production bundle.
  disableLogger: true
});
