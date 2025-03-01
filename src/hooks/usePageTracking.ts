import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from './useAuth';

export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const trackPageView = async () => {
      await supabase
        .from('analytics_events')
        .insert({
          event_type: 'page_view',
          user_id: user.id,
          metadata: {
            path: pathname,
            query: Object.fromEntries(searchParams.entries()),
            timestamp: new Date().toISOString(),
          },
        });
    };

    trackPageView();
  }, [pathname, searchParams, user]);
}