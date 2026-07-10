// In-memory PostgREST-style query builder.
// -----------------------------------------------------------------------------
// Emulates exactly the subset of the PostgREST-style client API the app uses:
// chainable, thenable builders off `from(table)` with select (embedded joins,
// count/head), filters, ordering, limits, single/maybeSingle, and the
// insert/update/delete/upsert mutations — resolving to `{ data, error, count }`.
//
// The builder is generic over the table's Row type (see types/db.ts), so every
// `db().from(...)` result is fully typed for feature code. Internally the engine
// is dynamic (it interprets column names at runtime), so it works on
// `Record<string, unknown>` rows and casts only at the comparison boundary — no
// `any`. The final projection is cast back to the caller's Row type.

import { table as getTable, setTable } from './store';
import { findRelationship } from './relationships';
import type { TableName, Tables } from '@/types/db';

export type QueryError = (Error & { code?: string; details?: string | null }) | null;
export type QueryResult<T> = { data: T; error: QueryError; count: number | null };

// A row as the engine stores/manipulates it: an untyped bag of columns. Feature
// code never sees this — the builder projects and casts to the table's Row type.
type StoredRow = Record<string, unknown>;
// Values the ordering/range operators can meaningfully compare.
type Comparable = string | number;

function makeError(message: string, code?: string): Error & { code?: string } {
  const err = new Error(message) as Error & { code?: string };
  if (code) err.code = code;
  return err;
}

// Columns that must be unique — the app relies on the resulting `23505` to drive
// retry/idempotency logic (slug minting, one-review-per-booking, webhook dedupe).
// Every table's primary key `id` is unique too: without it a fixed-id insert (e.g.
// the demo-snapshot self-heal, which reuses the original booking id) could create
// a duplicate row under a race, whereas real Postgres would reject the second.
const UNIQUE_COLUMNS: Partial<Record<TableName, string[]>> = {
  profiles: ['id'],
  braiders: ['id', 'slug'],
  services: ['id'],
  availability_rules: ['id'],
  availability_overrides: ['id'],
  bookings: ['id'],
  payments: ['id', 'stripe_refund_id'],
  reviews: ['id', 'booking_id'],
  audit_logs: ['id'],
  stripe_webhook_events: ['id']
};

// Booking statuses that occupy a slot — mirrors the WHERE clause of the
// production `bookings_no_overlap` exclusion constraint
// (supabase/migrations/0001_initial_schema.sql). A cancelled/completed/no-show
// booking frees its time.
const ACTIVE_BOOKING_STATUSES = ['pending_payment', 'confirmed'];

type Op = 'select' | 'insert' | 'update' | 'delete' | 'upsert';
type Predicate = (row: StoredRow) => boolean;

// --- select-string parsing ---------------------------------------------------

type Field =
  | { kind: 'col'; name: string }
  | { kind: 'embed'; key: string; base: string; sub: string };

// Split a comma-separated list, ignoring commas nested inside parentheses.
function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of input) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      if (current) parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function parseSelect(select: string): Field[] {
  const normalized = select.replace(/\s+/g, '');
  if (!normalized || normalized === '*') return [];
  return splitTopLevel(normalized).map((token): Field => {
    const paren = token.indexOf('(');
    if (paren === -1) return { kind: 'col', name: token };
    const head = token.slice(0, paren);
    const sub = token.slice(paren + 1, token.lastIndexOf(')'));
    // head is `alias:table!fkhint` / `table!fkhint` / `table`.
    const colon = head.indexOf(':');
    const alias = colon === -1 ? null : head.slice(0, colon);
    const relation = colon === -1 ? head : head.slice(colon + 1);
    const base = relation.split('!')[0] ?? relation;
    return { kind: 'embed', key: alias ?? base, base, sub };
  });
}

function projectRow(row: StoredRow, parentTable: string, fields: Field[]): StoredRow {
  // No projection requested → return a shallow copy of the whole row.
  if (fields.length === 0) return { ...row };
  const out: StoredRow = {};
  for (const field of fields) {
    if (field.kind === 'col') {
      out[field.name] = row[field.name];
      continue;
    }
    const rel = findRelationship(parentTable, field.base);
    if (!rel) {
      // Unregistered relation (a programming error — every embed the app uses is
      // registered). Default to null; the cardinality is unknown without `rel`.
      out[field.key] = null;
      continue;
    }
    const subFields = parseSelect(field.sub);
    const related = getTable(rel.target as TableName).filter(
      (t) => t[rel.targetKey] === row[rel.localKey]
    );
    if (rel.card === 'one') {
      out[field.key] = related[0] ? projectRow(related[0], rel.target, subFields) : null;
    } else {
      out[field.key] = related.map((r) => projectRow(r, rel.target, subFields));
    }
  }
  return out;
}

// --- or() filter parsing -----------------------------------------------------
// Supports the single grammar the app uses: `col.ilike.*value*` joined by commas.
function parseOr(filter: string): Predicate {
  const clauses = splitTopLevel(filter).map((clause): Predicate => {
    const [col, op, ...rest] = clause.split('.');
    if (!col || !op) return () => false;
    const value = rest.join('.');
    if (op === 'ilike') {
      const needle = value.replace(/\*/g, '').toLowerCase();
      return (row) => String(row[col] ?? '').toLowerCase().includes(needle);
    }
    if (op === 'eq') return (row) => String(row[col]) === value;
    return () => false;
  });
  return (row) => clauses.some((c) => c(row));
}

// -----------------------------------------------------------------------------

export class QueryBuilder<Row> implements PromiseLike<QueryResult<Row[]>> {
  private op: Op = 'select';
  private selectStr: string | null = null;
  private hasReturning = false;
  private countExact = false;
  private headOnly = false;
  private payload: StoredRow[] = [];
  private conflictColumn: string | undefined;
  private predicates: Predicate[] = [];
  private orderings: { col: string; ascending: boolean }[] = [];
  private limitCount: number | null = null;
  private cardinality: 'array' | 'single' | 'maybe' = 'array';

  constructor(private readonly tableName: TableName) {}

  // --- projection / mutation kind -------------------------------------------
  select(select = '*', options?: { count?: 'exact'; head?: boolean }): this {
    this.selectStr = select;
    if (this.op !== 'select') this.hasReturning = true;
    if (options?.count === 'exact') this.countExact = true;
    if (options?.head) this.headOnly = true;
    return this;
  }

  insert(rows: Partial<Row> | Partial<Row>[]): this {
    this.op = 'insert';
    this.payload = (Array.isArray(rows) ? rows : [rows]) as StoredRow[];
    return this;
  }

  update(patch: Partial<Row>): this {
    this.op = 'update';
    this.payload = [patch as StoredRow];
    return this;
  }

  delete(): this {
    this.op = 'delete';
    return this;
  }

  upsert(rows: Partial<Row> | Partial<Row>[], options?: { onConflict?: string }): this {
    this.op = 'upsert';
    this.payload = (Array.isArray(rows) ? rows : [rows]) as StoredRow[];
    this.conflictColumn = options?.onConflict;
    return this;
  }

  // --- filters ---------------------------------------------------------------
  eq(col: string, value: unknown): this {
    this.predicates.push((r) => r[col] === value);
    return this;
  }
  neq(col: string, value: unknown): this {
    this.predicates.push((r) => r[col] !== value);
    return this;
  }
  gt(col: string, value: Comparable): this {
    this.predicates.push((r) => (r[col] as Comparable) > value);
    return this;
  }
  gte(col: string, value: Comparable): this {
    this.predicates.push((r) => (r[col] as Comparable) >= value);
    return this;
  }
  lt(col: string, value: Comparable): this {
    this.predicates.push((r) => (r[col] as Comparable) < value);
    return this;
  }
  lte(col: string, value: Comparable): this {
    this.predicates.push((r) => (r[col] as Comparable) <= value);
    return this;
  }
  in(col: string, values: readonly unknown[]): this {
    this.predicates.push((r) => values.includes(r[col]));
    return this;
  }
  is(col: string, value: null | boolean): this {
    this.predicates.push((r) =>
      value === null ? r[col] === null || r[col] === undefined : r[col] === value
    );
    return this;
  }
  or(filter: string): this {
    this.predicates.push(parseOr(filter));
    return this;
  }

  // --- ordering / cardinality ------------------------------------------------
  order(col: string, options?: { ascending?: boolean }): this {
    this.orderings.push({ col, ascending: options?.ascending !== false });
    return this;
  }
  limit(count: number): this {
    this.limitCount = count;
    return this;
  }
  single(): PromiseLike<QueryResult<Row | null>> {
    this.cardinality = 'single';
    return this as unknown as PromiseLike<QueryResult<Row | null>>;
  }
  maybeSingle(): PromiseLike<QueryResult<Row | null>> {
    this.cardinality = 'maybe';
    return this as unknown as PromiseLike<QueryResult<Row | null>>;
  }

  // --- thenable --------------------------------------------------------------
  then<R1 = QueryResult<Row[]>, R2 = never>(
    onfulfilled?: ((value: QueryResult<Row[]>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null
  ): Promise<R1 | R2> {
    return Promise.resolve(this.run() as QueryResult<Row[]>).then(onfulfilled, onrejected);
  }
  catch<R = never>(
    onrejected?: ((reason: unknown) => R | PromiseLike<R>) | null
  ): Promise<QueryResult<Row[]> | R> {
    return this.then(undefined, onrejected);
  }
  finally(onfinally?: (() => void) | null): Promise<QueryResult<Row[]>> {
    return this.then(
      (v) => {
        onfinally?.();
        return v;
      },
      (e) => {
        onfinally?.();
        throw e;
      }
    );
  }

  private matches(row: StoredRow): boolean {
    return this.predicates.every((p) => p(row));
  }

  private shape(rows: StoredRow[], totalCount?: number): QueryResult<unknown> {
    const fields = parseSelect(this.selectStr ?? '*');
    const projected = rows.map((r) => projectRow(r, this.tableName, fields));
    // count:'exact' is the total matching the filter, independent of any limit or
    // range (PostgREST semantics) — so `totalCount` (the pre-limit count) is used
    // when supplied, letting callers show a correct "N of M".
    const exact = this.countExact ? totalCount ?? rows.length : null;
    if (this.cardinality === 'array') {
      return { data: projected, error: null, count: exact };
    }
    if (projected.length === 0) {
      // maybeSingle → no error; single → PostgREST returns an error, but every
      // caller treats a falsy `data` as "not found", so this is safe either way.
      const error =
        this.cardinality === 'single'
          ? (makeError('No rows found', 'PGRST116') as QueryError)
          : null;
      return { data: null, error, count: exact };
    }
    // .single() asserts exactly one row: >1 matches is a coercion error in
    // PostgREST (PGRST116). Surfacing it turns a silent "return the first of N" —
    // which would mask a duplicate-key bug — into a visible error. maybeSingle is
    // left permissive (returns the first) to preserve existing callers.
    if (this.cardinality === 'single' && projected.length > 1) {
      return {
        data: null,
        error: makeError('Cannot coerce the result to a single JSON object', 'PGRST116') as QueryError,
        count: exact
      };
    }
    return { data: projected[0], error: null, count: exact };
  }

  private run(): QueryResult<unknown> {
    try {
      switch (this.op) {
        case 'select':
          return this.runSelect();
        case 'insert':
          return this.runInsert();
        case 'update':
          return this.runUpdate();
        case 'delete':
          return this.runDelete();
        case 'upsert':
          return this.runUpsert();
      }
    } catch (err) {
      const error = (err instanceof Error ? err : makeError(String(err))) as QueryError;
      return { data: null, error, count: null };
    }
  }

  private runSelect(): QueryResult<unknown> {
    let rows = getTable(this.tableName).filter((r) => this.matches(r));
    const count = this.countExact ? rows.length : null;
    if (this.headOnly) return { data: null, error: null, count };

    if (this.orderings.length > 0) {
      rows = [...rows].sort((a, b) => {
        for (const { col, ascending } of this.orderings) {
          const av = a[col] as Comparable | null | undefined;
          const bv = b[col] as Comparable | null | undefined;
          if (av == null && bv == null) continue;
          if (av == null) return ascending ? -1 : 1;
          if (bv == null) return ascending ? 1 : -1;
          if (av < bv) return ascending ? -1 : 1;
          if (av > bv) return ascending ? 1 : -1;
        }
        return 0;
      });
    }
    if (this.limitCount != null) rows = rows.slice(0, this.limitCount);
    // Pass the pre-limit total so count:'exact' reflects all matches, not the page.
    return this.shape(rows, count ?? undefined);
  }

  private applyDefaults(raw: StoredRow): StoredRow {
    const row = { ...raw };
    if (row.id === undefined) row.id = crypto.randomUUID();
    if (row.created_at === undefined) row.created_at = new Date().toISOString();
    return row;
  }

  private uniqueViolation(row: StoredRow, rows: StoredRow[]): boolean {
    const uniques = UNIQUE_COLUMNS[this.tableName] ?? [];
    return uniques.some(
      (col) => row[col] != null && rows.some((existing) => existing[col] === row[col])
    );
  }

  // Emulates the production `bookings_no_overlap` GiST exclusion constraint: two
  // ACTIVE bookings for the same braider may never occupy overlapping time. Runs
  // synchronously inside the insert/update mutation, so — unlike the app-level
  // read-then-insert check in create.ts/reschedule.ts — it holds under concurrency
  // and raises 23P01 exactly like Postgres, keeping those actions' catch blocks
  // live. `all` is the live table; `candidate` is the post-defaults/post-patch row.
  private bookingOverlaps(candidate: StoredRow, all: StoredRow[]): boolean {
    if (this.tableName !== 'bookings') return false;
    if (!ACTIVE_BOOKING_STATUSES.includes(String(candidate.status))) return false;
    const start = Date.parse(String(candidate.scheduled_at));
    const end = start + Number(candidate.duration_minutes) * 60_000;
    if (Number.isNaN(start) || Number.isNaN(end)) return false;
    return all.some((other) => {
      // Skip self (same object on insert, same id on update).
      if (other === candidate || other.id === candidate.id) return false;
      if (other.braider_id !== candidate.braider_id) return false;
      if (!ACTIVE_BOOKING_STATUSES.includes(String(other.status))) return false;
      const oStart = Date.parse(String(other.scheduled_at));
      const oEnd = oStart + Number(other.duration_minutes) * 60_000;
      if (Number.isNaN(oStart)) return false;
      // Half-open [start, end) overlap, matching tstzrange's '[)' bounds.
      return start < oEnd && oStart < end;
    });
  }

  private returning(rows: StoredRow[]): QueryResult<unknown> {
    if (!this.hasReturning) return { data: null, error: null, count: null };
    return this.shape(rows);
  }

  private runInsert(): QueryResult<unknown> {
    const rows = getTable(this.tableName);
    const inserted: StoredRow[] = [];
    for (const raw of this.payload) {
      const row = this.applyDefaults(raw);
      if (this.uniqueViolation(row, rows)) {
        return { data: null, error: makeError('duplicate key value', '23505') as QueryError, count: null };
      }
      if (this.bookingOverlaps(row, rows)) {
        return {
          data: null,
          error: makeError('conflicting key value violates exclusion constraint "bookings_no_overlap"', '23P01') as QueryError,
          count: null
        };
      }
      rows.push(row);
      inserted.push(row);
    }
    return this.returning(inserted);
  }

  private runUpdate(): QueryResult<unknown> {
    const patch = this.payload[0] ?? {};
    const all = getTable(this.tableName);
    const matched = all.filter((r) => this.matches(r));
    // Validate the post-patch rows against the exclusion constraint BEFORE
    // committing, so a reschedule onto a taken slot fails atomically with 23P01
    // (matching Postgres + reschedule.ts's catch) instead of silently overlapping.
    if (this.tableName === 'bookings') {
      for (const row of matched) {
        if (this.bookingOverlaps({ ...row, ...patch }, all)) {
          return {
            data: null,
            error: makeError('conflicting key value violates exclusion constraint "bookings_no_overlap"', '23P01') as QueryError,
            count: null
          };
        }
      }
    }
    for (const row of matched) Object.assign(row, patch);
    return this.returning(matched);
  }

  private runDelete(): QueryResult<unknown> {
    const kept = getTable(this.tableName).filter((r) => !this.matches(r));
    setTable(this.tableName, kept);
    return this.returning([]);
  }

  private runUpsert(): QueryResult<unknown> {
    const rows = getTable(this.tableName);
    const affected: StoredRow[] = [];
    for (const raw of this.payload) {
      const conflictCol = this.conflictColumn;
      const existing =
        conflictCol && raw[conflictCol] != null
          ? rows.find((r) => r[conflictCol] === raw[conflictCol])
          : undefined;
      if (existing) {
        Object.assign(existing, raw);
        affected.push(existing);
      } else {
        const row = this.applyDefaults(raw);
        rows.push(row);
        affected.push(row);
      }
    }
    return this.returning(affected);
  }
}

// Re-export for consumers that build a typed builder directly.
export type { Tables };
