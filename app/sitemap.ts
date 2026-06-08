import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://braidflow.app').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/braiders`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/signup`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 }
  ];

  // Public braider profiles — only emit if Supabase is reachable. Using an
  // anonymous client here so it works at build time without service-role keys.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return staticRoutes;

  try {
    const supabase = createClient(url, anon);
    const { data } = await supabase
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
