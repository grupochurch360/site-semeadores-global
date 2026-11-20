import crypto from 'crypto';
import type { User } from '../src/types/index.ts';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    throw new Error('SESSION_SECRET é obrigatório em ambiente de produção');
  }
  if (process.env.NODE_ENV === 'production') {
    console.warn('[Auth] AVISO: SESSION_SECRET não definida na Vercel; configure-a em Environment Variables.');
  }
  return 'sfg-dev-secret-change-in-production';
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export interface SessionPayload {
  sub: string;
  role: string;
  regionId?: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf-8');
}

export function signSessionToken(user: Pick<User, 'id' | 'role' | 'regionId'>, ttlSeconds = TOKEN_TTL_SECONDS): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload: SessionPayload = {
    sub: user.id,
    role: user.role,
    ...(user.regionId ? { regionId: user.regionId } : {}),
    iat: now,
    exp: now + ttlSeconds,
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  if (!header || !body || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(`${header}.${body}`)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.sub || !payload.exp || payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function sanitizeUser(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash: _ignored, ...safe } = user;
  return safe;
}
