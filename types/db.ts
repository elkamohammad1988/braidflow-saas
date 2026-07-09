// Database schema types.
// -----------------------------------------------------------------------------
// The single source of truth for row shapes across the app. The in-memory demo
// store and the production Postgres schema (see db/migrations) both conform to
// these. Feature code reads them through the typed query builder (lib/db/query),
// so every `db().from(...)` result is fully typed — no `any`.
//
// Each Row carries its columns PLUS the relations it can embed (as optional
// fields), because PostgREST-style `select('…, services(name)')` returns embedded
// resources inline. Selecting without an embed simply leaves that field absent;
// typing it optional keeps both shapes valid while still catching column typos.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Role = 'braider' | 'client';
export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';
export type PaymentKind = 'deposit' | 'balance' | 'refund';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type OverrideKind = 'block' | 'open';

export interface ProfileRow {
  id: string;
  role: Role;
  full_name: string;
  phone: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface BraiderRow {
  id: string;
  slug: string;
  business_name: string;
  bio: string | null;
  city: string | null;
  hero_image_url: string | null;
  instagram_handle: string | null;
  accepting_bookings: boolean;
  timezone: string;
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  stripe_onboarding_complete: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  // Embeds
  services?: ServiceRow[];
  availability_rules?: AvailabilityRuleRow[];
  availability_overrides?: AvailabilityOverrideRow[];
  profiles?: ProfileRow | null;
}

export interface ServiceRow {
  id: string;
  braider_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  deposit_cents: number;
  is_active: boolean;
  created_at: string;
}

export interface AvailabilityRuleRow {
  id: string;
  braider_id: string;
  day_of_week: number;
  start_minute: number;
  end_minute: number;
}

export interface AvailabilityOverrideRow {
  id: string;
  braider_id: string;
  starts_at: string;
  ends_at: string;
  kind: OverrideKind;
  note: string | null;
}

export interface BookingRow {
  id: string;
  client_id: string | null;
  braider_id: string;
  service_id: string;
  scheduled_at: string;
  duration_minutes: number;
  price_cents: number;
  deposit_cents: number;
  status: BookingStatus;
  client_notes: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  guest_token: string | null;
  reminder_sent_at: string | null;
  final_reminder_sent_at: string | null;
  created_at: string;
  time_range: string | null;
  // Embeds
  services?: ServiceRow | null;
  braiders?: BraiderRow | null;
  profiles?: ProfileRow | null;
  /** Alias for the client profile: `client:profiles!bookings_client_id_fkey`. */
  client?: ProfileRow | null;
  payments?: PaymentRow[];
}

export interface PaymentRow {
  id: string;
  booking_id: string;
  kind: PaymentKind;
  amount_cents: number;
  status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_refund_id: string | null;
  created_at: string;
  // Embeds
  bookings?: BookingRow | null;
}

export interface ReviewRow {
  id: string;
  booking_id: string;
  braider_id: string;
  client_id: string | null;
  rating: number;
  body: string | null;
  created_at: string;
  // Embeds
  profiles?: ProfileRow | null;
  /** Alias for the client profile: `client:profiles!reviews_client_id_fkey`. */
  client?: ProfileRow | null;
  braiders?: BraiderRow | null;
}

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Json;
  created_at: string;
}

export interface StripeWebhookEventRow {
  id: string;
  type: string;
  created_at: string;
}

// Table-name → Row map. Drives the generic query builder's return typing.
export interface Tables {
  profiles: ProfileRow;
  braiders: BraiderRow;
  services: ServiceRow;
  availability_rules: AvailabilityRuleRow;
  availability_overrides: AvailabilityOverrideRow;
  bookings: BookingRow;
  payments: PaymentRow;
  reviews: ReviewRow;
  audit_logs: AuditLogRow;
  stripe_webhook_events: StripeWebhookEventRow;
}

export type TableName = keyof Tables;

// A stored row is any table's row (used internally by the store/query engine,
// which is dynamic by nature). Feature code never sees this — it gets `Tables[T]`.
export type AnyRow = Tables[TableName];
