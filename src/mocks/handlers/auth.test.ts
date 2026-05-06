import { describe, expect, it } from 'vitest';
import { parseJWT } from '@mocks/data';
import type { AuthResponse } from '@/types';

const isAuthResponse = (value: unknown): value is AuthResponse => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const user = candidate.user;

  if (!user || typeof user !== 'object' || Array.isArray(user)) {
    return false;
  }

  const candidateUser = user as Record<string, unknown>;

  return (
    typeof candidate.token === 'string' &&
    typeof candidateUser.id === 'string' &&
    typeof candidateUser.username === 'string' &&
    typeof candidateUser.email === 'string'
  );
};

const login = (body: unknown): Promise<Response> =>
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('auth handlers', () => {
  it('logs in a valid user', async () => {
    const response = await login({ username: 'test', password: 'test123' });
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(isAuthResponse(body)).toBe(true);

    if (!isAuthResponse(body)) {
      throw new Error('Expected an auth response');
    }

    expect(body.user).toEqual({
      id: '1',
      username: 'test',
      email: 'test@example.com',
    });
    expect(parseJWT(body.token)).toMatchObject({
      sub: '1',
      username: 'test',
    });
  });

  it('rejects a payload that is not an object', async () => {
    const response = await login(null);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Invalid credentials' });
  });

  it('rejects an array payload', async () => {
    const response = await login(['test', 'test123']);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Invalid credentials' });
  });

  it('rejects a payload with invalid field types', async () => {
    const response = await login({ username: 'test', password: 123 });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Invalid credentials' });
  });

  it('rejects an unknown username', async () => {
    const response = await login({ username: 'missing', password: 'test123' });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Invalid credentials' });
  });

  it('rejects an incorrect password', async () => {
    const response = await login({ username: 'test', password: 'wrong' });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: 'Invalid credentials' });
  });
});
