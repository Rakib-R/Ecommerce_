
'use client';

import { usePathname } from 'next/navigation';
import Header from './header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const hideHeaderRoutes = ['/login', '/signup', '/forgot-password'];
  const showHeader = !hideHeaderRoutes.some(route => pathname?.startsWith(route));

  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  );
}