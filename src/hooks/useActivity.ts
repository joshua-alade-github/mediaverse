import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import type { ActivityItem } from '@/types';

export function useActivityFeed(userId: string) {
  return useInfiniteQuery({
    queryKey: ['activity', userId],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('activity_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);

      if (error) throw error;
      return data as ActivityItem[];
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length : undefined;
    },
  });
}