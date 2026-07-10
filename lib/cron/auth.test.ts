import { afterEach, describe, expect, it } from 'vitest';
import { isAuthorizedCron } from './auth';

// The only auth on the cron routes (they bypass middleware). A regression here
// lets anyone trigger mass booking-expiry or reminder blasts.

const saved = process.env.CRON_SECRET;
afterEach(() => {
  if (saved === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = saved;
});

function req(authorization?: string): Request {
  return new Request('http://localhost/api/cron/x', {
    headers: authorization ? { authorization } : {}
  });
}

describe('isAuthorizedCron', () => {
  it('fails closed when CRON_SECRET is unset', () => {
    delete process.env.CRON_SECRET;
    expect(isAuthorizedCron(req('Bearer anything'))).toBe(false);
  });

  it('fails when CRON_SECRET is blank', () => {
    process.env.CRON_SECRET = '';
    expect(isAuthorizedCron(req('Bearer '))).toBe(false);
  });

  it('rejects a missing Authorization header', () => {
    process.env.CRON_SECRET = 'super-secret-cron-value';
    expect(isAuthorizedCron(req())).toBe(false);
  });

  it('rejects a wrong token (and a length mismatch does not throw)', () => {
    process.env.CRON_SECRET = 'super-secret-cron-value';
    expect(isAuthorizedCron(req('Bearer nope'))).toBe(false);
    expect(isAuthorizedCron(req('Bearer super-secret-cron-value-EXTRA'))).toBe(false);
  });

  it('accepts the exact bearer token', () => {
    process.env.CRON_SECRET = 'super-secret-cron-value';
    expect(isAuthorizedCron(req('Bearer super-secret-cron-value'))).toBe(true);
  });
});
