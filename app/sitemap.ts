import type { MetadataRoute } from 'next';
import { dbAdmin } from '@/lib/db/server';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/braiders`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 }
  ];

  try {
    const { data } = await dbAdmin()
      .from('braiders')
      .select('slug')
      // Only index braiders who are actually bookable (accepting AND charges live),
      // matching the public directory — otherwise the sitemap points crawlers at
      // profiles whose book flow dead-ends.
      .eq('accepting_bookings', true)
      .eq('charges_enabled', true)
      .limit(5000);

    const braiderRoutes: MetadataRoute.Sitemap = (data ?? []).map((b: { slug: string }) => ({
      url: `${siteUrl}/braiders/${b.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }));

    return [...staticRoutes, ...braiderRoutes];
  } catch {
    return staticRoutes;
  }
}
