import type { auth } from '../auth/index';

export type Role = 'user' | 'seller' | 'admin';
type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = Omit<AuthSession['user'], 'role'> & { role: Role };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser; // must be AuthUser, not AuthSession['user']
      session?: AuthSession['session'];
    }
  }
}
