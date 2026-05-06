import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateFakeJWT, isTokenExpired, parseJWT } from './jwt';

const encodePayload = (payload: unknown) => {
  const json = JSON.stringify(payload);
  const binary = Array.from(new TextEncoder().encode(json), (byte) => String.fromCharCode(byte)).join('');

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const createTokenWithPayload = (payload: unknown) => `header.${encodePayload(payload)}.signature`;

describe('jwt helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates a parseable fake JWT with issued and expiry timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const token = generateFakeJWT({ sub: 'user-1', username: 'test' });
    const [header, payload, signature] = token.split('.');

    expect(header).toBeTruthy();
    expect(payload).toBeTruthy();
    expect(signature).toBe('fakesignature');
    expect(parseJWT(token)).toEqual({
      sub: 'user-1',
      username: 'test',
      iat: 1704067200,
      exp: 1704096000,
    });
  });

  it('returns null when a token has no payload segment', () => {
    expect(parseJWT('not-a-jwt')).toBeNull();
  });

  it('returns null when a token payload is not valid base64 JSON', () => {
    expect(parseJWT('header.not-valid-base64.signature')).toBeNull();
  });

  it('returns null when a token payload is not an object', () => {
    expect(parseJWT(createTokenWithPayload(['not', 'an', 'object']))).toBeNull();
  });

  it('returns null when a token payload is null', () => {
    expect(parseJWT(createTokenWithPayload(null))).toBeNull();
  });

  it('detects a valid token as not expired before the expiry timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    const token = generateFakeJWT({ sub: 'user-1' });

    vi.setSystemTime(new Date('2024-01-01T07:59:59.000Z'));

    expect(isTokenExpired(token)).toBe(false);
  });

  it('detects a token as expired at the expiry timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    const token = generateFakeJWT({ sub: 'user-1' });

    vi.setSystemTime(new Date('2024-01-01T08:00:00.000Z'));

    expect(isTokenExpired(token)).toBe(true);
  });

  it('treats tokens without numeric expiry as expired', () => {
    expect(isTokenExpired(createTokenWithPayload({ exp: 'tomorrow' }))).toBe(true);
    expect(isTokenExpired(createTokenWithPayload({ sub: 'user-1' }))).toBe(true);
    expect(isTokenExpired('invalid-token')).toBe(true);
  });
});
