import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { BraiderReviews } from '@/components/braider/reviews';
import { formatDuration, formatMoney } from '@/lib/utils';

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = supabaseServer();
  const { data: braider } = await supabase
    .from('braiders')
    .select('business_name, bio, city, hero_image_url')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!braider) return { title: 'Braider not found' };

  const title = `${braider.business_name} — Book braids${braider.city ? ` in ${braider.city}` : ''}`;
  const description =
    braider.bio?.slice(0, 155) ??
    `Book ${braider.business_name} for braids and protective styles. Real-time availability — a deposit holds your slot.`;

  return {
    title,
    description,
    alternates: { canonical: `/braiders/${params.slug}` },
    openGraph: {
      title,
      description,
      type: 'profile',
      images: braider.hero_image_url ? [{ url: braider.hero_image_url }] : undefined
    }
  };
}

export default async function BraiderProfile({ params }: { params: { slug: string } }) {
  const supabase = supabaseServer();
  const { data: braider, error } = await supabase
    .from('braiders')
    .select(
      'id, slug, business_name, bio, city, hero_image_url, instagram_handle, accepting_bookings, charges_enabled, services(id, name, description, duration_minutes, price_cents, deposit_cents, is_active)'
    )
    .eq('slug', params.slug)
    .maybeSingle();

  if (error) throw error;
  if (!braider) notFound();

  const services = (braider.services ?? []).filter((s) => s.is_active);
  // Bookable only when accepting AND Stripe can take charges for them.
  const open = braider.accepting_bookings && braider.charges_enabled;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-10 md:grid-cols-[1fr_320px]">
        <div>
          {braider.hero_image_url && (
            <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-card bg-ink/5">
              <Image
                src={braider.hero_image_url}
                alt={braider.business_name}
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                priority
                className="object-cover"
              />
            </div>
          )}

          <h1 className="font-display text-4xl text-ink">{braider.business_name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-ink-muted">
            {braider.city && <span>{braider.city}</span>}
            {braider.instagram_handle && (
              <>
                <span aria-hidden>·</span>
                <a
                  href={`https://instagram.com/${braider.instagram_handle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink"
                >
                  @{braider.instagram_handle}
                </a>
              </>
            )}
          </div>

          {braider.bio && (
            <p className="mt-6 max-w-prose text-ink-muted">{braider.bio}</p>
          )}

          <section className="mt-10">
            <h2 className="font-display text-2xl text-ink">Services</h2>
            <ul className="mt-4 divide-y divide-ink/5 border-y border-ink/5">
              {services.map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium text-ink">{s.name}</p>
                    {s.description && (
                      <p className="mt-1 text-sm text-ink-muted">{s.description}</p>
                    )}
                    <p className="mt-1 text-xs text-ink-muted">
                      {formatDuration(s.duration_minutes)} · deposit {formatMoney(s.deposit_cents)}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-lg text-ink">
                    {formatMoney(s.price_cents)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <BraiderReviews braiderId={braider.id} />
        </div>

        <aside className="md:sticky md:top-6 md:self-start">
          <div className="rounded-card border border-ink/5 bg-white p-6 shadow-soft">
            <p className="font-display text-xl text-ink">Book an appointment</p>
            <p className="mt-1 text-sm text-ink-muted">
              Pick a service and a time that works. Deposit holds your slot.
            </p>
            <div className="mt-5">
              {open ? (
                <Link href={`/braiders/${braider.slug}/book`}>
                  <Button className="w-full">See available times</Button>
                </Link>
              ) : (
                <p className="rounded-lg border border-ink/10 bg-cream px-4 py-3 text-center text-sm text-ink-muted">
                  Books are closed right now.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
