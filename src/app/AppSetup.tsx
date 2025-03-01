'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppInit } from '@/components/App/AppInit';
import { useDataSync } from '@/hooks/useDataSync';

export function AppSetup() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Handle auth redirects
    const protectedRoutes = ['/profile', '/settings', '/lists/create'];
    const authRoutes = ['/login', '/signup'];

    if (!loading) {
      if (user && authRoutes.some(route => pathname?.startsWith(route))) {
        const redirectTo = searchParams?.get('redirectTo') || '/';
        router.replace(redirectTo);
      } else if (!user && protectedRoutes.some(route => pathname?.startsWith(route))) {
        router.replace(`/login?redirectTo=${encodeURIComponent(pathname || '')}`);
      }
    }
  }, [user, loading, pathname, router, searchParams]);

  useEffect(() => {
    // Clear query cache on logout
    if (!user) {
      queryClient.clear();
    }
  }, [user, queryClient]);

  useDataSync();

  return <AppInit />;
}