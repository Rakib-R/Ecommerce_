'use client';

import { authClient } from "../configs/auth-client";
import { SellerType } from '../../types';

export default function useSeller() {
  const { data: session, isPending, error } = authClient.useSession();

  const isSeller = session?.user?.role === 'seller';

  return {
    seller: isSeller ? (session?.user as unknown as SellerType) : null,
    isLoading: isPending,
    error: error || null,
    isAuthenticated: !!session && isSeller,
  };
}
