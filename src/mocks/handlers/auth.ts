import { delay, http, HttpResponse } from 'msw';
import type { AuthResponse, LoginPayload, User } from '@/types';
import { generateFakeJWT, getUserByUsername } from '@mocks/data';

const isLoginPayload = (value: unknown): value is LoginPayload => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.username === 'string' && typeof candidate.password === 'string';
};

export const authHandlers = [
  http.post('/api/login', async ({ request }) => {
    await delay(700);

    const body: unknown = await request.json();

    if (!isLoginPayload(body)) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const userWithPassword = getUserByUsername(body.username);

    if (!userWithPassword || userWithPassword.password !== body.password) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user: User = {
      id: userWithPassword.id,
      username: userWithPassword.username,
      email: userWithPassword.email,
    };
    const response: AuthResponse = {
      token: generateFakeJWT({ sub: user.id, username: user.username }),
      user,
    };

    return HttpResponse.json(response, { status: 200 });
  }),
];
