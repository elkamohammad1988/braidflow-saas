import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSessionToken, readSessionToken } from './session-token';
import { base64urlEncode, hmacSign } from '@/lib/crypto/signing';

// The session cookie IS the authentication boundary — every server action trusts
// readSessionToken. These lock forge/expiry/tamper/domain-separation so a
// regression can't silently let a forged cookie through.

const encoder = new TextEncoder();
const savedSecret = process.env.AUTH_SECRET;

beforeAll(() => {
  // Pin a deterministic signing key for the suite.
  process.env.AUTH_SECRET = 'test-session-secret-please-ignore';
});
afterAll(() => {
  if (savedSecret === undefined) delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET = savedSecret;
});

const payload = { sub: 'u1', email: 'a@b.com', role: 'braider' as const, name: 'Amara' };

describe('session token', () => {
  it('round-trips a valid token', async () => {
    const token = await createSessionToken(payload, 3600);
    const read = await readSessionToken(token);
    expect(read).toMatchObject(payload);
    expect(read?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('rejects a tampered payload (signature no longer matches)', async () => {
    const token = await createSessionToken(payload, 3600);
    const [, sig] = token.split('.');
    // Forge a body that elevates to a different subject, keep the old signature.
    const forgedBody = base64urlEncode(
      encoder.encode(JSON.stringify({ ...payload, sub: 'victim', exp: Math.floor(Date.now() / 1000) + 3600 }))
    );
    expect(await readSessionToken(`${forgedBody}.${sig}`)).toBeNull();
  });

  it('rejects a tampered signature', async () => {
    const token = await createSessionToken(payload, 3600);
    const dot = token.lastIndexOf('.');
    const body = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const flipped = (sig[0] === 'A' ? 'B' : 'A') + sig.slice(1);
    expect(await readSessionToken(`${body}.${flipped}`)).toBeNull();
  });

  it('rejects an expired token', async () => {
    const token = await createSessionToken(payload, -1); // exp already in the past
    expect(await readSessionToken(token)).toBeNull();
  });

  it('rejects malformed input', async () => {
    expect(await readSessionToken(undefined)).toBeNull();
    expect(await readSessionToken(null)).toBeNull();
    expect(await readSessionToken('')).toBeNull();
    expect(await readSessionToken('no-dot')).toBeNull();
    expect(await readSessionToken('.onlysig')).toBeNull();
  });

  it('enforces domain separation — a snapshot-context signature is not a valid session', async () => {
    // A signature minted under a different context must NOT validate as a session,
    // even though both contexts share the same key.
    const body = base64urlEncode(encoder.encode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 3600 })));
    const snapshotSig = await hmacSign('snapshot', body);
    expect(await readSessionToken(`${body}.${snapshotSig}`)).toBeNull();
  });

  it('rejects a validly-signed body missing required claims', async () => {
    const body = base64urlEncode(encoder.encode(JSON.stringify({ email: 'x', exp: Math.floor(Date.now() / 1000) + 3600 })));
    const sig = await hmacSign('session', body);
    expect(await readSessionToken(`${body}.${sig}`)).toBeNull();
  });
});
