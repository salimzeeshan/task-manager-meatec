const textEncoder = new TextEncoder();

const bytesToBase64 = (bytes: Uint8Array): string => {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

  return btoa(binary);
};

const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const toBase64Url = (value: object): string => {
  const json = JSON.stringify(value);
  const base64 = bytesToBase64(textEncoder.encode(json));

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const fromBase64Url = (value: string): Record<string, unknown> | null => {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const bytes = base64ToBytes(`${base64}${padding}`);
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return null;
  } catch {
    return null;
  }
};

export const generateFakeJWT = (payload: object): string => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = toBase64Url({ alg: 'HS256', typ: 'JWT' });
  const tokenPayload = toBase64Url({
    ...payload,
    iat: issuedAt,
    exp: issuedAt + 60 * 60 * 8,
  });

  return `${header}.${tokenPayload}.fakesignature`;
};

export const parseJWT = (token: string): Record<string, unknown> | null => {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  return fromBase64Url(payload);
};

export const isTokenExpired = (token: string): boolean => {
  const payload = parseJWT(token);
  const expiresAt = payload?.exp;

  if (typeof expiresAt !== 'number') {
    return true;
  }

  return Math.floor(Date.now() / 1000) >= expiresAt;
};
