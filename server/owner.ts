import { createHmac, timingSafeEqual } from 'node:crypto';
import type { User } from '../src/types/index.ts';

export const ownerId = 'platform-owner';
export function ownerAccount(): User | null {
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const hash = process.env.OWNER_PASSWORD_HASH;
  return email && hash && /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash)
    ? {
        id: ownerId,
        name: 'Arthur',
        email,
        passwordHash: hash,
        role: 'global_admin',
        active: true,
      }
    : null;
}
function signature(exp: string, owner: User) {
  return createHmac('sha256', owner.passwordHash!)
    .update('config-admin:' + owner.email + ':' + exp)
    .digest('hex');
}
export function ownerToken(owner: User) {
  const exp = String(Date.now() + 3600000);
  return 'owner.' + exp + '.' + signature(exp, owner);
}
export function verifyOwnerToken(token: string) {
  const parts = /^owner\.(\d+)\.([a-f0-9]{64})$/.exec(token);
  const owner = ownerAccount();
  if (!parts || !owner || Number(parts[1]) <= Date.now()) return null;
  return timingSafeEqual(
    Buffer.from(parts[2]),
    Buffer.from(signature(parts[1], owner)),
  )
    ? owner
    : null;
}
