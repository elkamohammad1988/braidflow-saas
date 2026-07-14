// Deterministic demo dataset.
// -----------------------------------------------------------------------------
// Seeds the in-memory store with a realistic, self-consistent world so every
// screen — dashboard, calendar, appointments, clients, the public directory,
// profiles, reviews and a client's own bookings — is populated out of the box.
// Rebuilt on each cold start; ids are stable constants so the personas in
// lib/auth/personas.ts always line up with their data.
//
// Times are anchored to the braider's own timezone (America/New_York) and to the
// *current* week, so appointments always render at sane wall-clock hours (never a
// server-UTC-shifted "6 AM") and the calendar/dashboard are full whatever day the
// demo is opened. Never derive a displayed time from the server's wall clock.

import { TZDate } from '@date-fns/tz';
import { addDays, startOfWeek } from 'date-fns';
import { BRAIDER_PERSONA, CLIENT_PERSONA, NEW_BRAIDER_PERSONA } from '@/lib/auth/personas';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';
import { BRAID_PHOTOS } from '@/lib/media';
import type {
  ProfileRow,
  BraiderRow,
  ServiceRow,
  AvailabilityRuleRow,
  AvailabilityOverrideRow,
  BookingRow,
  PaymentRow,
  ReviewRow,
  AuditLogRow,
  StripeWebhookEventRow
} from '@/types/db';

// Fully-typed fixture store: every seeded row is validated against its schema
// type at construction. The query engine bridges this to its dynamic
// `Record<string, unknown>` view in lib/db/store.ts.
export type Store = {
  profiles: ProfileRow[];
  braiders: BraiderRow[];
  services: ServiceRow[];
  availability_rules: AvailabilityRuleRow[];
  availability_overrides: AvailabilityOverrideRow[];
  bookings: BookingRow[];
  payments: PaymentRow[];
  reviews: ReviewRow[];
  audit_logs: AuditLogRow[];
  stripe_webhook_events: StripeWebhookEventRow[];
};

// --- Stable ids --------------------------------------------------------------
const AMARA = BRAIDER_PERSONA.id;
const ZOE = CLIENT_PERSONA.id;
// The fresh studio a braider sign-up lands in — deliberately empty (see below).
const NEW_STUDIO = NEW_BRAIDER_PERSONA.id;

const NIA = '00000000-0000-4000-8000-000000000011';
const IMANI = '00000000-0000-4000-8000-000000000012';
const DESTINY = '00000000-0000-4000-8000-000000000013';
const JASMINE = '00000000-0000-4000-8000-000000000014';

const BRAIDER_KEKELI = '00000000-0000-4000-8000-000000000002';
const BRAIDER_CROWN = '00000000-0000-4000-8000-000000000003';
const BRAIDER_SABLE = '00000000-0000-4000-8000-000000000004';

// Amara's services.
const SVC_KNOTLESS = 'a0000000-0000-4000-8000-000000000001';
const SVC_BOHO = 'a0000000-0000-4000-8000-000000000002';
const SVC_CORNROWS = 'a0000000-0000-4000-8000-000000000003';
const SVC_TWISTS = 'a0000000-0000-4000-8000-000000000004';
const SVC_KIDS = 'a0000000-0000-4000-8000-000000000005';

// Amara's timezone. All of her appointment instants are built as wall-clock
// times in this zone (see `wall` below) so they display exactly as intended.
const BRAIDER_TZ = 'America/New_York';

// The public "money shot": a confirmed guest booking with a stable capability
// token, so the deposit-secured confirmation renders deterministically at
//   /bookings/<MONEY_SHOT_BOOKING>/confirmation?t=<MONEY_SHOT_TOKEN>
// with no login. Keep these stable — the screenshot guide references them.
const MONEY_SHOT_BOOKING = 'e0000000-0000-4000-8000-0000000000f1';
const MONEY_SHOT_TOKEN = 'demo-confirm-simone';

export function seed(): Store {
  const now = new Date();

  // "Now" and this week's Monday, expressed in the braider's zone. date-fns
  // carries the TZDate through, so these stay zone-anchored.
  const zNow = new TZDate(now, BRAIDER_TZ);
  const monday = startOfWeek(zNow, { weekStartsOn: 1 });

  // Absolute instant for a wall-clock time in the braider's zone, `dayOffset`
  // days from this week's Monday. e.g. wall(0, 10) → Monday 10:00 in New York.
  const wall = (dayOffset: number, hour: number, minute = 0): string => {
    const day = addDays(monday, dayOffset);
    // Return a UTC-Z instant (`…:00.000Z`), NOT `TZDate.toISOString()` — the latter
    // emits an OFFSET string (`…-04:00`). The in-memory engine compares/sorts
    // `scheduled_at` LEXICOGRAPHICALLY (lib/db/query.ts), and every runtime writer
    // (create.ts / reschedule.ts) stores UTC-Z; mixing formats makes seeded rows
    // sort and range-filter wrong (a booking can vanish from a week view). Collapse
    // the zoned wall-clock to its absolute instant, then serialize as UTC-Z so the
    // store-wide invariant documented in create.ts holds.
    return new Date(
      new TZDate(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute, 0, BRAIDER_TZ).getTime()
    ).toISOString();
  };
  const daysAgo = (days: number): string => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const profiles: ProfileRow[] = [
    { id: AMARA, role: 'braider', full_name: 'Amara Johnson', phone: '(404) 555-0148', email: BRAIDER_PERSONA.email, avatar_url: null, created_at: daysAgo(320) },
    { id: ZOE, role: 'client', full_name: 'Zoe Adams', phone: '(404) 555-0111', email: CLIENT_PERSONA.email, avatar_url: null, created_at: daysAgo(90) },
    { id: NIA, role: 'client', full_name: 'Nia Williams', phone: '(678) 555-0192', email: 'nia@example.com', avatar_url: null, created_at: daysAgo(140) },
    { id: IMANI, role: 'client', full_name: 'Imani Clarke', phone: '(470) 555-0173', email: 'imani@example.com', avatar_url: null, created_at: daysAgo(120) },
    { id: DESTINY, role: 'client', full_name: 'Destiny Brooks', phone: '(404) 555-0164', email: 'destiny@example.com', avatar_url: null, created_at: daysAgo(75) },
    { id: JASMINE, role: 'client', full_name: 'Jasmine Reed', phone: '(678) 555-0155', email: 'jasmine@example.com', avatar_url: null, created_at: daysAgo(60) },
    // Profiles for the other directory braiders (own their braider row).
    { id: BRAIDER_KEKELI, role: 'braider', full_name: 'Kekeli Mensah', phone: null, email: 'kekeli@example.com', avatar_url: null, created_at: daysAgo(200) },
    { id: BRAIDER_CROWN, role: 'braider', full_name: 'Renee Carter', phone: null, email: 'renee@example.com', avatar_url: null, created_at: daysAgo(180) },
    { id: BRAIDER_SABLE, role: 'braider', full_name: 'Adaeze Okafor', phone: null, email: 'adaeze@example.com', avatar_url: null, created_at: daysAgo(150) },
    // The fresh-studio persona a braider sign-up lands in (empty by design).
    { id: NEW_STUDIO, role: 'braider', full_name: 'Your Studio', phone: null, email: NEW_BRAIDER_PERSONA.email, avatar_url: null, created_at: daysAgo(0) }
  ];

  const braider = (
    over: Partial<BraiderRow> & Pick<BraiderRow, 'id' | 'slug' | 'business_name'>
  ): BraiderRow => ({
    bio: null,
    city: null,
    hero_image_url: null,
    instagram_handle: null,
    accepting_bookings: true,
    timezone: DEFAULT_TIMEZONE,
    stripe_account_id: 'acct_demo',
    charges_enabled: true,
    payouts_enabled: true,
    stripe_onboarding_complete: true,
    onboarding_completed_at: daysAgo(300),
    created_at: daysAgo(300),
    ...over
  });

  const braiders = [
    braider({
      id: AMARA,
      slug: 'amara-braids',
      business_name: 'Amara Braids',
      bio: 'Protective styles done with care in the heart of Atlanta. Knotless, boho, twists and cornrows — clean parts, comfortable tension, and a relaxed chair. Ten years braiding and still obsessed with the craft.',
      city: 'Atlanta, GA',
      hero_image_url: BRAID_PHOTOS.triangleParts,
      instagram_handle: 'amara.braids',
      timezone: 'America/New_York'
    }),
    braider({
      id: BRAIDER_KEKELI,
      slug: 'kekeli-studio',
      business_name: 'Kekeli Studio',
      bio: 'Boutique braiding studio specialising in micro braids and goddess locs.',
      city: 'Brooklyn, NY',
      hero_image_url: BRAID_PHOTOS.boxBraidsTop,
      instagram_handle: 'kekeli.studio',
      timezone: 'America/New_York'
    }),
    braider({
      id: BRAIDER_CROWN,
      slug: 'crown-and-coils',
      business_name: 'Crown & Coils',
      bio: 'Fulani braids, cornrows and feed-ins. Fast, neat, and kid-friendly.',
      city: 'Houston, TX',
      hero_image_url: BRAID_PHOTOS.feedInClose,
      instagram_handle: 'crownandcoils',
      timezone: 'America/Chicago'
    }),
    braider({
      id: BRAIDER_SABLE,
      slug: 'sable-and-gold',
      business_name: 'Sable & Gold',
      bio: 'Luxury knotless and twist styling on the North Side.',
      city: 'Chicago, IL',
      hero_image_url: BRAID_PHOTOS.longBeaded,
      instagram_handle: 'sableandgold',
      timezone: 'America/Chicago'
    }),
    // The fresh studio a braider sign-up lands in: no services, no hours, no
    // Stripe — so its dashboard shows the activation checklist, the Connect
    // prompt and every empty state. Kept out of the public directory
    // (accepting_bookings: false) until it's actually set up.
    braider({
      id: NEW_STUDIO,
      slug: 'your-studio',
      business_name: 'Your Studio',
      accepting_bookings: false,
      stripe_account_id: null,
      charges_enabled: false,
      payouts_enabled: false,
      stripe_onboarding_complete: false,
      onboarding_completed_at: null,
      created_at: daysAgo(0)
    })
  ];

  const service = (
    over: Partial<ServiceRow> &
      Pick<ServiceRow, 'id' | 'braider_id' | 'name' | 'duration_minutes' | 'price_cents' | 'deposit_cents'>
  ): ServiceRow => ({
    description: null,
    is_active: true,
    created_at: daysAgo(280),
    ...over
  });

  const services = [
    service({ id: SVC_KNOTLESS, braider_id: AMARA, name: 'Knotless Box Braids', description: 'Medium, mid-back length. Lightweight and low-tension.', duration_minutes: 300, price_cents: 18000, deposit_cents: 4000 }),
    service({ id: SVC_BOHO, braider_id: AMARA, name: 'Boho Knotless', description: 'Knotless braids with curly pieces throughout.', duration_minutes: 360, price_cents: 22000, deposit_cents: 5000 }),
    service({ id: SVC_CORNROWS, braider_id: AMARA, name: 'Feed-in Cornrows', description: 'Straight-back or custom design, 6–8 rows.', duration_minutes: 120, price_cents: 9000, deposit_cents: 2500 }),
    service({ id: SVC_TWISTS, braider_id: AMARA, name: 'Passion Twists', description: 'Shoulder to mid-back. Soft, full and lightweight.', duration_minutes: 240, price_cents: 16000, deposit_cents: 4000 }),
    service({ id: SVC_KIDS, braider_id: AMARA, name: 'Kids Braids', description: 'Ages 10 and under. Gentle and quick.', duration_minutes: 90, price_cents: 7000, deposit_cents: 2000 }),
    // Other braiders — two services each (enough for directory "from" price).
    service({ id: 'b1000000-0000-4000-8000-000000000001', braider_id: BRAIDER_KEKELI, name: 'Micro Box Braids', duration_minutes: 420, price_cents: 20000, deposit_cents: 5000 }),
    service({ id: 'b1000000-0000-4000-8000-000000000002', braider_id: BRAIDER_KEKELI, name: 'Goddess Locs', duration_minutes: 360, price_cents: 24000, deposit_cents: 6000 }),
    service({ id: 'b1000000-0000-4000-8000-000000000003', braider_id: BRAIDER_CROWN, name: 'Fulani Braids', duration_minutes: 240, price_cents: 15000, deposit_cents: 3500 }),
    service({ id: 'b1000000-0000-4000-8000-000000000004', braider_id: BRAIDER_CROWN, name: 'Cornrow Set', duration_minutes: 120, price_cents: 8000, deposit_cents: 2000 }),
    service({ id: 'b1000000-0000-4000-8000-000000000005', braider_id: BRAIDER_SABLE, name: 'Knotless Braids', duration_minutes: 300, price_cents: 19000, deposit_cents: 4500 }),
    service({ id: 'b1000000-0000-4000-8000-000000000006', braider_id: BRAIDER_SABLE, name: 'Twist Out Style', duration_minutes: 150, price_cents: 11000, deposit_cents: 3000 })
  ];

  // Amara works Mon–Sat, 9:00–17:00 (minutes from midnight: 540–1020).
  const availability_rules = [1, 2, 3, 4, 5, 6].map((day) => ({
    id: `c0000000-0000-4000-8000-00000000000${day}`,
    braider_id: AMARA,
    day_of_week: day,
    start_minute: 540,
    end_minute: 1020
  }));

  // A clean, future "time off" block (a weekend away), in the braider's zone.
  const availability_overrides: AvailabilityOverrideRow[] = [
    {
      id: 'd0000000-0000-4000-8000-000000000001',
      braider_id: AMARA,
      starts_at: wall(12, 0),
      ends_at: wall(14, 0),
      kind: 'block',
      note: 'Out of town'
    }
  ];

  // --- Bookings --------------------------------------------------------------
  let bookingSeq = 0;
  const booking = (
    over: Partial<BookingRow> &
      Pick<
        BookingRow,
        'service_id' | 'scheduled_at' | 'duration_minutes' | 'price_cents' | 'deposit_cents' | 'status'
      >
  ): BookingRow => {
    bookingSeq += 1;
    return {
      id: `e0000000-0000-4000-8000-0000000000${String(bookingSeq).padStart(2, '0')}`,
      client_id: null,
      braider_id: AMARA,
      client_notes: null,
      guest_name: null,
      guest_email: null,
      guest_phone: null,
      guest_token: null,
      reminder_sent_at: null,
      final_reminder_sent_at: null,
      created_at: daysAgo(1),
      time_range: null,
      ...over
    };
  };

  const bookings = [
    // ── This week — confirmed (green on the calendar) ──────────────────────
    booking({ client_id: NIA, service_id: SVC_KNOTLESS, scheduled_at: wall(0, 10), duration_minutes: 300, status: 'confirmed', price_cents: 18000, deposit_cents: 4000 }),
    booking({ client_id: IMANI, service_id: SVC_TWISTS, scheduled_at: wall(1, 13), duration_minutes: 240, status: 'confirmed', price_cents: 16000, deposit_cents: 4000 }),
    booking({ client_id: ZOE, service_id: SVC_BOHO, scheduled_at: wall(2, 11), duration_minutes: 360, status: 'confirmed', price_cents: 22000, deposit_cents: 5000 }),
    booking({ client_id: DESTINY, service_id: SVC_KNOTLESS, scheduled_at: wall(4, 9, 30), duration_minutes: 300, status: 'confirmed', price_cents: 18000, deposit_cents: 4000 }),
    // The money shot: a confirmed guest booking with a stable token.
    booking({ id: MONEY_SHOT_BOOKING, service_id: SVC_KNOTLESS, scheduled_at: wall(5, 12), duration_minutes: 300, status: 'confirmed', price_cents: 18000, deposit_cents: 4000, guest_name: 'Simone Carter', guest_email: 'simone.carter@example.com', guest_phone: '(404) 555-0198', guest_token: MONEY_SHOT_TOKEN }),
    // ── This week — awaiting deposit (amber on the calendar) ───────────────
    booking({ service_id: SVC_CORNROWS, scheduled_at: wall(3, 15), duration_minutes: 120, status: 'pending_payment', price_cents: 9000, deposit_cents: 2500, guest_name: 'Tasha Green', guest_email: 'tasha@example.com', guest_phone: '(404) 555-0120', guest_token: 'demo-guest-token-tasha' }),
    booking({ client_id: JASMINE, service_id: SVC_TWISTS, scheduled_at: wall(5, 16, 30), duration_minutes: 240, status: 'pending_payment', price_cents: 16000, deposit_cents: 4000 }),
    booking({ client_id: ZOE, service_id: SVC_CORNROWS, scheduled_at: wall(6, 14), duration_minutes: 120, status: 'pending_payment', price_cents: 9000, deposit_cents: 2500 }),
    // ── Past — completed (revenue this month + review-eligible) ────────────
    booking({ client_id: NIA, service_id: SVC_KNOTLESS, scheduled_at: wall(-2, 11), duration_minutes: 300, status: 'completed', price_cents: 18000, deposit_cents: 4000 }),
    booking({ client_id: ZOE, service_id: SVC_CORNROWS, scheduled_at: wall(-4, 14), duration_minutes: 120, status: 'completed', price_cents: 9000, deposit_cents: 2500 }),
    booking({ client_id: IMANI, service_id: SVC_BOHO, scheduled_at: wall(-6, 10), duration_minutes: 360, status: 'completed', price_cents: 22000, deposit_cents: 5000 }),
    booking({ client_id: JASMINE, service_id: SVC_TWISTS, scheduled_at: wall(-9, 13), duration_minutes: 240, status: 'completed', price_cents: 16000, deposit_cents: 4000 }),
    booking({ client_id: DESTINY, service_id: SVC_KNOTLESS, scheduled_at: wall(-13, 15), duration_minutes: 300, status: 'completed', price_cents: 18000, deposit_cents: 4000 }),
    // Returning clients — a second completed visit each (lifetime value builds).
    booking({ client_id: NIA, service_id: SVC_CORNROWS, scheduled_at: wall(-16, 11), duration_minutes: 120, status: 'completed', price_cents: 9000, deposit_cents: 2500 }),
    booking({ client_id: ZOE, service_id: SVC_KIDS, scheduled_at: wall(-20, 10), duration_minutes: 90, status: 'completed', price_cents: 7000, deposit_cents: 2000 }),
    // Tasha has braided here before, too — so her upcoming (awaiting) booking
    // isn't her first (she reads as a returning client, not a $0 ghost).
    booking({ service_id: SVC_CORNROWS, scheduled_at: wall(-11, 16), duration_minutes: 120, status: 'completed', price_cents: 9000, deposit_cents: 2500, guest_name: 'Tasha Green', guest_email: 'tasha@example.com', guest_phone: '(404) 555-0120' }),
    // ── Past — no-show (deposit kept: the whole "no-show protection" pitch) ─
    booking({ client_id: JASMINE, service_id: SVC_KIDS, scheduled_at: wall(-8, 16), duration_minutes: 90, status: 'no_show', price_cents: 7000, deposit_cents: 2000 }),
    // ── Past — cancelled in policy → deposit refunded ──────────────────────
    booking({ service_id: SVC_CORNROWS, scheduled_at: wall(-5, 12), duration_minutes: 120, status: 'cancelled', price_cents: 9000, deposit_cents: 2500, guest_name: 'Mia Cole', guest_email: 'mia@example.com', guest_phone: '(470) 555-0133', guest_token: 'demo-guest-token-mia' })
  ];

  // Deposit payment per booking, plus a refund row for the cancelled one.
  //   • confirmed / completed / no_show → deposit succeeded (collected/kept)
  //   • pending_payment                 → deposit pending (not yet collected)
  //   • cancelled                       → deposit succeeded, then refunded
  let paymentSeq = 0;
  const payments: PaymentRow[] = bookings.flatMap((b) => {
    paymentSeq += 1;
    const collected =
      b.status === 'confirmed' ||
      b.status === 'completed' ||
      b.status === 'no_show' ||
      b.status === 'cancelled';
    const deposit: PaymentRow = {
      id: `f0000000-0000-4000-8000-0000000000${String(paymentSeq).padStart(2, '0')}`,
      booking_id: b.id,
      kind: 'deposit',
      amount_cents: b.deposit_cents,
      status: collected ? 'succeeded' : 'pending',
      stripe_payment_intent_id: `pi_demo_${paymentSeq}`,
      stripe_charge_id: collected ? `ch_demo_${paymentSeq}` : null,
      stripe_refund_id: null,
      created_at: b.created_at
    };
    if (b.status !== 'cancelled') return [deposit];
    paymentSeq += 1;
    const refund: PaymentRow = {
      id: `f0000000-0000-4000-8000-0000000000${String(paymentSeq).padStart(2, '0')}`,
      booking_id: b.id,
      kind: 'refund',
      amount_cents: b.deposit_cents,
      status: 'refunded',
      stripe_payment_intent_id: `pi_demo_${paymentSeq}`,
      stripe_charge_id: deposit.stripe_charge_id,
      stripe_refund_id: `re_demo_${paymentSeq}`,
      created_at: b.created_at
    };
    return [deposit, refund];
  });

  // --- Reviews ---------------------------------------------------------------
  // One review per client, attached to their most recent completed booking, so a
  // returning client with several completed visits doesn't produce duplicates.
  const reviewBodies: Record<string, { rating: number; body: string | null }> = {
    [NIA]: { rating: 5, body: 'Amara is incredible — my knotless braids came out so neat and lasted weeks. Gentle on my edges too.' },
    [ZOE]: { rating: 5, body: 'Fast, friendly and the parts were perfect. Already booked my next appointment.' },
    [IMANI]: { rating: 4, body: 'Beautiful boho knotless. Took a little longer than expected but worth it.' },
    [JASMINE]: { rating: 5, body: 'Best passion twists I have ever had. Lightweight and full.' }
  };
  const completedForReview = bookings
    .filter((b) => b.status === 'completed' && b.client_id && reviewBodies[b.client_id as string])
    .sort((a, b) => (a.scheduled_at < b.scheduled_at ? 1 : -1));
  const reviewedClients = new Set<string>();
  let reviewSeq = 0;
  const reviews: ReviewRow[] = completedForReview
    .filter((b) => {
      if (reviewedClients.has(b.client_id as string)) return false;
      reviewedClients.add(b.client_id as string);
      return true;
    })
    .map((b) => {
      reviewSeq += 1;
      const r = reviewBodies[b.client_id as string]!;
      return {
        id: `10000000-0000-4000-8000-0000000000${String(reviewSeq).padStart(2, '0')}`,
        booking_id: b.id,
        braider_id: AMARA,
        client_id: b.client_id,
        rating: r.rating,
        body: r.body,
        created_at: b.scheduled_at
      };
    });

  // A few reviews for the other directory braiders so ratings show on cards.
  reviews.push(
    { id: '10000000-0000-4000-8000-0000000000a1', booking_id: '20000000-0000-4000-8000-0000000000a1', braider_id: BRAIDER_KEKELI, client_id: ZOE, rating: 5, body: 'Micro braids were flawless.', created_at: daysAgo(30) },
    { id: '10000000-0000-4000-8000-0000000000a2', booking_id: '20000000-0000-4000-8000-0000000000a2', braider_id: BRAIDER_KEKELI, client_id: NIA, rating: 5, body: 'Loved my goddess locs.', created_at: daysAgo(45) },
    { id: '10000000-0000-4000-8000-0000000000a3', booking_id: '20000000-0000-4000-8000-0000000000a3', braider_id: BRAIDER_CROWN, client_id: IMANI, rating: 4, body: 'Great Fulani braids, quick too.', created_at: daysAgo(20) }
  );

  return {
    profiles,
    braiders,
    services,
    availability_rules,
    availability_overrides,
    bookings,
    payments,
    reviews,
    audit_logs: [],
    stripe_webhook_events: []
  };
}
