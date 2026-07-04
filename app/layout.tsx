import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, Space_Mono } from 'next/font/google';
import { JsonLd } from '@/components/shared/json-ld';
import { DemoBadge } from '@/components/demo/demo-badge';
import { isDemoMode } from '@/lib/demo';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'BraidFlow',
    title: 'BraidFlow — booking for braiders',
    description:
      'Take deposits, manage your schedule, and stop chasing down DMs. Built for braiders.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BraidFlow — booking for braiders',
    description:
      'Take deposits, manage your schedule, and stop chasing down DMs. Built for braiders.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
  }
};

export const viewport: Viewport = {
  themeColor: '#f5eee3',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-cream shadow-lifted focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
        >
          Skip to content
        </a>
        {/* Flag JS on before first paint so scroll-reveal content is hidden only
            when we can actually animate it in — without JS it stays visible. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        {/* Site-wide film grain — fixed, pointer-transparent, barely there. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[100] opacity-[0.035] mix-blend-multiply"
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
        {children}
        {isDemoMode() && <DemoBadge />}
      </body>
    </html>
  );
}
