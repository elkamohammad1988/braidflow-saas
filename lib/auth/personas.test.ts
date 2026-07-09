import { describe, expect, it } from 'vitest';
import {
  resolveIdentity,
  BRAIDER_PERSONA,
  CLIENT_PERSONA,
  NEW_BRAIDER_PERSONA
} from './personas';

describe('resolveIdentity', () => {
  it('maps the documented busy-studio email to the populated Amara persona', () => {
    expect(resolveIdentity('amara@braidflow.app')).toBe(BRAIDER_PERSONA);
    // Case/whitespace-insensitive so a copy-paste with stray spaces still lands.
    expect(resolveIdentity('  AMARA@braidflow.app ')).toBe(BRAIDER_PERSONA);
  });

  it('routes a braider sign-up to a fresh, empty studio (onboarding experience)', () => {
    expect(resolveIdentity('newbie@example.com', 'braider')).toBe(NEW_BRAIDER_PERSONA);
  });

  it('routes a client sign-up to the populated client persona', () => {
    expect(resolveIdentity('someone@example.com', 'client')).toBe(CLIENT_PERSONA);
  });

  it('lets a known email win over a conflicting role hint', () => {
    expect(resolveIdentity('amara@braidflow.app', 'client')).toBe(BRAIDER_PERSONA);
  });

  it('defaults an unknown email with no role to the client experience', () => {
    expect(resolveIdentity('random@example.com')).toBe(CLIENT_PERSONA);
  });

  it('gives the fresh studio a distinct braider identity from Amara', () => {
    expect(NEW_BRAIDER_PERSONA.id).not.toBe(BRAIDER_PERSONA.id);
    expect(NEW_BRAIDER_PERSONA.role).toBe('braider');
  });
});
