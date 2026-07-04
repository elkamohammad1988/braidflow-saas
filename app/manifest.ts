import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BraidFlow',
    short_name: 'BraidFlow',
    description:
      'The booking platform built for braiders — take deposits, manage your schedule, and stop chasing down DMs.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5eee3',
    theme_color: '#f5eee3',
    icons: [{ src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' }]
  };
}
