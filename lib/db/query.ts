// In-memory PostgREST-style query builder.
// -----------------------------------------------------------------------------
// Emulates exactly the subset of the PostgREST-style client API the app uses:
// chainable, thenable builders off `from(table)` with select (embedded joins,
// count/head), filters, ordering, limits, single/maybeSingle, and the
// insert/update/delete/upsert mutations — resolving to `{ data, error, count }`.
// It is intentionally small: only what this codebase calls is implemented.

import { table as getTable, setTable, type TableName } from './store';
import { findRelationship } from './relationships';

export type QueryError = (Error & { code?: string; details?: string | null }) | null;
export type QueryResult<T = any> = { data: T; error: QueryError; count: number | null };

// `single()`/`maybeSingle()` resolve to a single row (or null); everything else
// resolves to a row array. Typing the array case as `any[]` (not bare `any`)
// means callers' `.map`/`.reduce`/`.filter` callbacks get a contextual param
// type and don't trip `noImplicitAny`.
type ArrayQueryResult = QueryResult<any[]>;
type SingleQueryResult = QueryResult<any>;
type SingleQueryBuilder = PromiseLike<SingleQueryResult>;

function makeError(message: string, code?: string): Error & { code?: string } {
  const err = new Error(message) as Error & { code?: string };
  if (code) err.code = code;
  return err;
}

// Columns that must be unique — the app relies on the resulting `23505` to drive
// retry/idempotency logic (slug minting, one-review-per-booking, webhook dedupe).
const UNIQUE_COLUMNS: Partial<Record<TableName, string[]>> = {
  profiles: ['id'],
  braiders: ['id', 'slug'],
  reviews: ['booking_id'],
  stripe_webhook_events: ['id']
};

type Op = 'select' | 'insert' | 'update' | 'delete' | 'upsert';
type Predicate = (row: any) => boolean;

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

function projectRow(row: any, parentTable: string, fields: Field[]): any {
  // No projection requested → return a shallow copy of the whole row.
  if (fields.length === 0) return { ...row };
  const out: any = {};
  for (const field of fields) {
    if (field.kind === 'col') {
      out[field.name] = row[field.name];
      continue;
    }
    const rel = findRelationship(parentTable, field.base);
    if (!rel) {
      out[field.key] = rel && (rel as any).card === 'many' ? [] : null;
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
      return (row: any) => String(row[col] ?? '').toLowerCase().includes(needle);
    }
    if (op === 'eq') return (row: any) => String(row[col]) === value;
    return () => false;
  });
  return (row: any) => clauses.some((c) => c(row));
}

// -----------------------------------------------------------------------------

export class QueryBuilder implements PromiseLike<ArrayQueryResult> {
  private op: Op = 'select';
  private selectStr: string | null = null;
  private hasReturning = false;
  private countExact = false;
  private headOnly = false;
  private payload: any[] = [];
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

  insert(rows: any | any[]): this {
    this.op = 'insert';
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  update(patch: any): this {
    this.op = 'update';
    this.payload = [patch];
    return this;
  }

  delete(): this {
    this.op = 'delete';
    return this;
  }

  upsert(rows: any | any[], options?: { onConflict?: string }): this {
    this.op = 'upsert';
    this.payload = Array.isArray(rows) ? rows : [rows];
    this.conflictColumn = options?.onConflict;
    return this;
  }

  // --- filters ---------------------------------------------------------------
  eq(col: string, value: any): this {
    this.predicates.push((r) => r[col] === value);
    return this;
  }
  neq(col: string, value: any): this {
    this.predicates.push((r) => r[col] !== value);
    return this;
  }
  gt(col: string, value: any): this {
    this.predicates.push((r) => r[col] > value);
    return this;
  }
  gte(col: string, value: any): this {
    this.predicates.push((r) => r[col] >= value);
    return this;
  }
  lt(col: string, value: any): this {
    this.predicates.push((r) => r[col] < value);
    return this;
  }
  lte(col: string, value: any): this {
    this.predicates.push((r) => r[col] <= value);
    return this;
  }
  in(col: string, values: any[]): this {
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
  single(): SingleQueryBuilder {
    this.cardinality = 'single';
    return this as unknown as SingleQueryBuilder;
  }
  maybeSingle(): SingleQueryBuilder {
    this.cardinality = 'maybe';
    return this as unknown as SingleQueryBuilder;
  }

  // --- thenable --------------------------------------------------------------
  then<R1 = ArrayQueryResult, R2 = never>(
    onfulfilled?: ((value: ArrayQueryResult) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null
  ): Promise<R1 | R2> {
    return Promise.resolve(this.run()).then(onfulfilled, onrejected);
  }
  catch<R = never>(
    onrejected?: ((reason: any) => R | PromiseLike<R>) | null
  ): Promise<ArrayQueryResult | R> {
    return this.then(undefined, onrejected);
  }
  finally(onfinally?: (() => void) | null): Promise<ArrayQueryResult> {
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

  private matches(row: any): boolean {
    return this.predicates.every((p) => p(row));
  }

  private shape(rows: any[]): QueryResult {
    const fields = parseSelect(this.selectStr ?? '*');
    const projected = rows.map((r) => projectRow(r, this.tableName, fields));
    if (this.cardinality === 'array') {
      return { data: projected, error: null, count: this.countExact ? rows.length : null };
    }
    if (projected.length === 0) {
      // maybeSingle → no error; single → PostgREST returns an error, but every
      // caller treats a falsy `data` as "not found", so this is safe either way.
      const error =
        this.cardinality === 'single'
          ? (makeError('No rows found', 'PGRST116') as QueryError)
          : null;
      return { data: null, error, count: this.countExact ? 0 : null };
    }
    return { data: projected[0], error: null, count: this.countExact ? rows.length : null };
  }

  private run(): QueryResult {
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

  private runSelect(): QueryResult {
    let rows = getTable(this.tableName).filter((r) => this.matches(r));
    const count = this.countExact ? rows.length : null;
    if (this.headOnly) return { data: null, error: null, count };

    if (this.orderings.length > 0) {
      rows = [...rows].sort((a, b) => {
        for (const { col, ascending } of this.orderings) {
          const av = a[col];
          const bv = b[col];
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
    return this.shape(rows);
  }

  private applyDefaults(raw: any): any {
    const row = { ...raw };
    if (row.id === undefined) row.id = crypto.randomUUID();
    if (row.created_at === undefined) row.created_at = new Date().toISOString();
    return row;
  }

  private uniqueViolation(row: any, rows: any[]): boolean {
    const uniques = UNIQUE_COLUMNS[this.tableName] ?? [];
    return uniques.some(
      (col) => row[col] != null && rows.some((existing) => existing[col] === row[col])
    );
  }

  private returning(rows: any[]): QueryResult {
    if (!this.hasReturning) return { data: null, error: null, count: null };
    return this.shape(rows);
  }

  private runInsert(): QueryResult {
    const rows = getTable(this.tableName);
    const inserted: any[] = [];
    for (const raw of this.payload) {
      const row = this.applyDefaults(raw);
      if (this.uniqueViolation(row, rows)) {
        return { data: null, error: makeError('duplicate key value', '23505') as QueryError, count: null };
      }
      rows.push(row);
      inserted.push(row);
    }
    return this.returning(inserted);
  }

  private runUpdate(): QueryResult {
    const patch = this.payload[0] ?? {};
    const matched = getTable(this.tableName).filter((r) => this.matches(r));
    for (const row of matched) Object.assign(row, patch);
    return this.returning(matched);
  }

  private runDelete(): QueryResult {
    const kept = getTable(this.tableName).filter((r) => !this.matches(r));
    setTable(this.tableName, kept);
    return this.returning([]);
  }

  private runUpsert(): QueryResult {
    const rows = getTable(this.tableName);
    const affected: any[] = [];
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
