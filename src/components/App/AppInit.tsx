'use client';

import { useEffect } from 'react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useDataSync } from '@/hooks/useDataSync';
import { initializeSupabase } from '@/lib/supabase/init';

export function AppInit() {
  useRealtimeUpdates();
  useDataSync();

  useEffect(() => {
    const cleanup = initializeSupabase();
    return () => cleanup();
  }, []);

  return null;
}