import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Content-Security-Policy. Next's inline runtime needs 'unsafe-inline' for
// scripts/styles (a nonce-based policy would need
// per-request middleware injection); the value here still meaningfully hardens the
// app: it pins where scripts/frames/images/connections may come from, forbids
// framing (clickjacking) and plugins, and locks <base>/form targets. Stripe and
// Sentry hosts are allow-listed so switching on real payments/monitoring works
// without loosening the policy.
const isDev = process.env.NODE_ENV === 'development';

// React Fast Refresh (HMR) evaluates strings as JavaScript in `next dev`, which
// needs 'unsafe-eval'. Add it in development ONLY — production must never ship
// 'unsafe-eval'.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com"
  : "script-src 'self' 'unsafe-inline' https://js.stripe.com";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.stripe.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.sentry.io https://*.ingest.sentry.io",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'"
  // (No upgrade-insecure-requests: HSTS already forces HTTPS in production, and
  // the directive would try to upgrade same-origin http://localhost during dev.)
].join('; ');

// Security headers applied to every response.
const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Sever window.opener links to cross-origin pages we navigate to (tab-nabbing),
  // while still allowing popups so Stripe's 3-D Secure challenge window works.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  // Deny powerful features by default; delegate `payment` to Stripe.js so Payment
  // Request / Apple Pay in Elements keeps working, and opt out of the Topics API.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), usb=(), payment=(self "https://js.stripe.com"), browsing-topics=()'
  }
  // NB: Cross-Origin-Resource-Policy is intentionally NOT set globally — a
  // `same-origin` value would block social crawlers from fetching /opengraph-image.
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle (.next/standalone) for a lean Docker
  // image. Ignored by Vercel, which handles output on its own.
  output: 'standalone',
  images: {
    // AVIF first (≈15-25% smaller than WebP on the braider photography), WebP
    // fallback. Next negotiates by the browser's Accept header.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }]
  },
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
    // Hoist barrel imports so only the used members land in the shared bundle
    // (trims ~12 kB off the braider-profile First Load). The benign next-intl
    // PackFileCache warnings during build come from next-intl's own extractor and
    // appear regardless of this setting.
    optimizePackageImports: ['next-intl', 'date-fns', 'lucide-react'],
    // Required on Next 14 so instrumentation.ts (which boots Sentry on the
    // server/edge runtimes) is loaded.
    instrumentationHook: true
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // The guest booking pages carry a capability token in the URL (`?t=…`).
      // The global `strict-origin-when-cross-origin` already keeps the query
      // string from crossing origins; pin these routes to `no-referrer` so the
      // token can't leak in a Referer at all (same-origin or downgrade included).
      {
        source: '/bookings/:path*',
        headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }]
      }
    ];
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
