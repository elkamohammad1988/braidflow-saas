import type { Metadata, Viewport } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import { JsonLd } from '@/components/shared/json-ld';
import { RouteAnnouncer } from '@/components/shared/route-announcer';
import { DemoBadge } from '@/components/demo/demo-badge';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { isRtl } from '@/i18n/config';
import { isDemoMode } from '@/lib/demo';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
// Headings share the Inter family (Linear/Vercel house style), set apart by
// weight + tight optical tracking rather than a decorative serif.
const display = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap'
});
const mono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
  display: 'swap'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BraidFlow — booking for braiders',
    template: '%s · BraidFlow'
  },
  description:
    'Take deposits, manage your schedule, and stop chasing down DMs. BraidFlow is the booking platform built for braiders.',
  keywords: [
    'braiding booking',
    'braider booking software',
    'hair appointment platform',
    'salon booking',
    'stripe deposits',
    'no-show prevention',
    'braid scheduling'
  ],
  authors: [{ name: 'BraidFlow' }],
  creator: 'BraidFlow',
  // No title/description here on purpose: leaving them unset lets each route's
  // own `title`/`description` flow into its OpenGraph/Twitter tags (a child that
  // sets only top-level title does NOT override an explicit parent og:title). The
  // home page, which sets no metadata of its own, inherits the defaults above.
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'BraidFlow'
  },
  twitter: {
    card: 'summary_large_image'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
  }
};

export const viewport: Viewport = {
  // Single dark experience — the browser chrome matches the page background.
  themeColor: '#04030A',
  width: 'device-width',
  initialScale: 1
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations('common');
  const dir = isRtl(locale) ? 'rtl' : 'ltr';
  return (
    <html
      lang={locale}
      dir={dir}
      // Dark-only product: pin `.dark` in the SSR markup so `dark:` variants apply
      // from the first paint. It never changes — there is no theme toggle.
      className={`dark ${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lifted focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[200]"
        >
          {t('skipToContent')}
        </a>
        {/* Ambient key-light — a fixed violet wash from the top so the whole app
            reads as lit from above. Sits behind content; pointer-transparent. */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-ambient-top" />
        {/* Site-wide film grain — fixed, pointer-transparent, barely there. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[100] opacity-[0.035] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
          }}
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': `${siteUrl}/#organization`,
                name: 'BraidFlow',
                url: siteUrl,
                description:
                  'The booking platform built for braiders — take deposits, manage your schedule, and stop chasing down DMs.'
              },
              {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                url: siteUrl,
                name: 'BraidFlow',
                publisher: { '@id': `${siteUrl}/#organization` }
              }
            ]
          }}
        />
        {/* Single dark experience — `.dark` is pinned statically on <html> above,
            so there is no theme context to provide and no toggle to drive. */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <RouteAnnouncer />
          {isDemoMode() && <DemoBadge />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
