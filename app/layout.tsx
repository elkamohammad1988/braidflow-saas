import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { JsonLd } from '@/components/shared/json-ld';
import { RouteAnnouncer } from '@/components/shared/route-announcer';
import { ThemeScript } from '@/components/theme/theme-script';
import { DemoBadge } from '@/components/demo/demo-badge';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { isRtl } from '@/i18n/config';
import { isDemoMode } from '@/lib/demo';
import './globals.css';

// Fonts are self-hosted (files in ./fonts, checked into the repo) via
// next/font/local rather than fetched from Google at build time. This makes
// compiles and production builds fully offline-resilient — no network round-trip
// to fonts.googleapis.com/fonts.gstatic.com, which otherwise fails on flaky or
// air-gapped networks and stalls the build. The files are the exact Google faces
// (fontsource distribution), subset to the ranges we actually paint.

// Inter is a variable font: this single latin file carries the full 100–900 weight
// range, so headings (font-medium/semibold/bold, Linear/Vercel house style) share
// it — no second font file. `--font-display` is aliased to `--font-sans` in
// globals.css so the Tailwind `display` stack still resolves.
const sans = localFont({
  src: './fonts/inter-latin-wght-normal.woff2',
  weight: '100 900',
  variable: '--font-sans',
  display: 'swap'
});
const mono = localFont({
  src: [
    { path: './fonts/space-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/space-mono-latin-700-normal.woff2', weight: '700', style: 'normal' }
  ],
  variable: '--font-mono',
  display: 'swap'
});
// Arabic script webfont. Inter/Space Mono carry no Arabic glyphs, so without this
// every RTL screen fell back to a generic OS font. IBM Plex Sans Arabic is drawn
// to harmonise with Latin grotesques (Inter). It sits AFTER the Latin faces in the
// family stack (globals.css / tailwind.config), so per-glyph fallback keeps Latin
// on Inter and only Arabic characters resolve here — this is the font's arabic
// subset only (its Latin subset is never used, so we don't ship it). `preload:
// false` keeps this off the four LTR locales (en/fr/es/zh-CN) that never paint an
// Arabic glyph; browsers fetch it lazily only when Arabic actually renders.
const arabic = localFont({
  src: [
    { path: './fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2', weight: '700', style: 'normal' }
  ],
  variable: '--font-arabic',
  display: 'swap',
  preload: false
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app';

// Map the active app locale to an OpenGraph locale tag so social previews are
// tagged in the language actually rendered (the app is served per-locale from
// one URL, so this reflects the request's resolved locale).
const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  ar: 'ar_AR',
  es: 'es_ES',
  'zh-CN': 'zh_CN'
};

// Namespaces used ONLY by server components (the marketing + legal pages). Server
// components read messages straight from the request config, so these never need
// to reach the client — keeping them out of NextIntlClientProvider trims ~19 kB
// of strings from every page's serialized HTML + hydration payload.
const SERVER_ONLY_NAMESPACES = ['landing', 'legal', 'pricing', 'meta'];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
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
    // No title/description in openGraph on purpose: leaving them unset lets each
    // route's own `title`/`description` flow into its OpenGraph/Twitter tags (a
    // child that sets only top-level title does NOT override an explicit parent
    // og:title). The home page, which sets no metadata of its own, inherits the
    // defaults above.
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[locale] ?? 'en_US',
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
}

export const viewport: Viewport = {
  // Browser chrome matches the active page background. The manual toggle keeps
  // this meta in sync at runtime; these entries cover the initial system-matched
  // paint (light = premium purple, dark = luxury charcoal).
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7FF' },
    { media: '(prefers-color-scheme: dark)', color: '#07030F' }
  ],
  width: 'device-width',
  initialScale: 1
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  // Only ship client-consumed namespaces to the browser (see SERVER_ONLY_NAMESPACES).
  const clientMessages = Object.fromEntries(
    Object.entries(messages).filter(([ns]) => !SERVER_ONLY_NAMESPACES.includes(ns))
  );
  const t = await getTranslations('common');
  const dir = isRtl(locale) ? 'rtl' : 'ltr';
  return (
    <html
      lang={locale}
      dir={dir}
      // No theme class in the SSR markup: the blocking ThemeScript (first child of
      // <body>) sets `.dark` + `color-scheme` from the stored/OS preference before
      // paint, so both registers are flash-free. `suppressHydrationWarning` lets
      // React tolerate the class the script adds.
      className={`${sans.variable} ${mono.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeScript />
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-on-accent shadow-lifted focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[200]"
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
                logo: `${siteUrl}/icon.svg`,
                description:
                  'The booking platform built for braiders — take deposits, manage your schedule, and stop chasing down DMs.'
              },
              {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                url: siteUrl,
                name: 'BraidFlow',
                publisher: { '@id': `${siteUrl}/#organization` },
                // Declares the site's braider search so Google can surface a
                // Sitelinks Search Box; /braiders?q= is a live endpoint.
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${siteUrl}/braiders?q={search_term_string}`
                  },
                  'query-input': 'required name=search_term_string'
                }
              }
            ]
          }}
        />
        {/* The blocking ThemeScript above sets the active register before paint;
            the ThemeToggle in the chrome flips `.dark` on <html> at runtime, so
            both themes are driven purely by that class — no React theme context. */}
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          {children}
          <RouteAnnouncer />
          {isDemoMode() && <DemoBadge />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
