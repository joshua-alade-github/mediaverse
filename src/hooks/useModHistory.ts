import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';

export function useModHistory() {
  return useInfiniteQuery({
    queryKey: ['mod-history'],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('moderation_actions')
        .select(`
          *,
          moderator:user_profiles(username)
        `)
        .order('created_at', { ascending: false })
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < 20) return undefined;
      return pages.length;
    },
  });
}