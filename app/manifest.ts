import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BraidFlow',
    short_name: 'BraidFlow',
    description:
      'The booking platform built for braiders — take deposits, manage your schedule, and stop chasing down DMs.',
    start_url: '/',
    display: 'standalone',
    background_color: '#04030A',
    theme_color: '#04030A',
    icons: [{ src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' }]
  };
}
