'use client';

import { authClient } from '../configs/auth-client';
import { UserType } from '../../types';

export default function useUser() {
  const { data: session, isPending, error } = authClient.useSession();

  const isUser = session?.user?.role === 'user';

  return {
    user: isUser ? (session?.user as unknown as UserType) : null,
    isLoading: isPending,
    error: error || null,
    // 🛑 Hard Gate: Only authenticated if they match the required buyer policy role
    isAuthenticated: !!session && isUser,
  };
}
