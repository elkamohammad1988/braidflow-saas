import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BraidFlow',
    short_name: 'BraidFlow',
    description:
      'The booking platform built for braiders — take deposits, manage your schedule, and stop chasing down DMs.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07030F',
    theme_color: '#07030F',
    icons: [
      // Any-size vector for browsers that accept SVG icons…
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
      // …plus a raster maskable icon so adaptive Android launchers get a properly
      // shaped, non-letterboxed install/splash icon (generated at /maskable-icon).
      { src: '/maskable-icon', type: 'image/png', sizes: '512x512', purpose: 'maskable' }
    ]
  };
}
