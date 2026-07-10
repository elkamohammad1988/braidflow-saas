import { describe, expect, it } from 'vitest';
import { authorizeBookingMutation } from './access';
import { generateGuestToken } from './guest-token';

// authorizeBookingMutation gates cancel/reschedule. A regression in the branch
// order lets one user act on another's booking, or a bad token slip through.

const token = generateGuestToken();
const booking = { client_id: 'client-1', braider_id: 'braider-1', guest_token: token };

describe('authorizeBookingMutation', () => {
  it('authorizes the owning client (session)', async () => {
    expect(await authorizeBookingMutation(booking, 'client-1')).toEqual({ role: 'client', userId: 'client-1' });
  });

  it('authorizes the owning braider (session)', async () => {
    expect(await authorizeBookingMutation(booking, 'braider-1')).toEqual({ role: 'braider', userId: 'braider-1' });
  });

  it('authorizes a guest presenting the correct token', async () => {
    expect(await authorizeBookingMutation(booking, null, token)).toEqual({ role: 'guest', userId: null });
  });

  it('rejects a guest presenting a wrong token', async () => {
    expect(await authorizeBookingMutation(booking, null, 'not-the-token')).toEqual({
      error: 'This link is no longer valid.'
    });
  });

  it('rejects an anonymous caller with no session and no token', async () => {
    expect(await authorizeBookingMutation(booking, null)).toEqual({ error: 'You need to be signed in.' });
  });

  it('rejects a signed-in stranger (neither client nor braider)', async () => {
    expect(await authorizeBookingMutation(booking, 'someone-else')).toEqual({ error: 'Not your booking.' });
  });

  it('a valid token wins even when the session is a stranger', async () => {
    // The token branch is evaluated first, so possession of the capability token
    // authorizes regardless of who is (or isn't) logged in.
    expect(await authorizeBookingMutation(booking, 'someone-else', token)).toEqual({ role: 'guest', userId: null });
  });

  it('a guest booking with no stored token cannot be opened by an empty token', async () => {
    const guestBooking = { client_id: null, braider_id: 'braider-1', guest_token: null };
    expect(await authorizeBookingMutation(guestBooking, null, '')).toEqual({ error: 'You need to be signed in.' });
  });
});
