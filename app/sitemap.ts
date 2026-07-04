import type { MetadataRoute } from 'next';
import { dbAdmin } from '@/lib/db/server';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/braiders`, lastModified: now, changeFrequency: 'daily', priority: 0.8 }
  ];

  try {
    const { data } = await dbAdmin()
      .from('braiders')
      .select('slug')
      .eq('accepting_bookings', true)
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
