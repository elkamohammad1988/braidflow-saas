import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { JsonLd } from '@/components/shared/json-ld';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
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
  themeColor: '#faf6f1',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
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
      </body>
    </html>
  );
}
