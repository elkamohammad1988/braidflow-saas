import { timingSafeEqual } from 'crypto';

// Constant-time check of the Vercel Cron bearer token. A plain `!==` compare
// leaks timing information that can be used to recover the secret; this is the
// only auth on the cron routes (they bypass middleware), so it must be safe.
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const provided = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch — guard first (the length check
  // itself isn't secret-dependent).
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
