alter table payments
  add column if not exists stripe_refund_id text unique;

create index if not exists payments_booking_kind_idx
  on payments (booking_id, kind);
