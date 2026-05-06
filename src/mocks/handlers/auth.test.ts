import { describe, expect, it } from 'vitest';
import { parseJWT } from '@mocks/data';
import { authHandlers } from './auth';

const login = (body: unknown): Promise<Response> =>
  (authHandlers[0] as any).resolver({
    request: new Request('http://localhost/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  });

describe('auth handlers', () => {
  it('logs in a valid user', async () => {
    const response = await login({ username: 'test', password: 'test123' });
    const body = await response.json();

    expect(response.status).toBe(200);
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
