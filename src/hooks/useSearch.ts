import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { searchAllServices } from '@/lib/services/media';
import type { Media, MediaType } from '@/types';

interface UseSearchOptions {
  includeExternal?: boolean;
  mediaTypes?: MediaType[];
}

export function useSearch(query: string, options: UseSearchOptions = {}) {
  const { includeExternal = true, mediaTypes } = options;

  // Local database search
  const localSearch = useQuery({
    queryKey: ['local-search', query, mediaTypes],
    queryFn: async () => {
      let searchQuery = supabase
        .from('media')
        .select('*')
        .textSearch('title', query, {
          type: 'websearch',
          config: 'english'
        });

      if (mediaTypes?.length) {
        searchQuery = searchQuery.in('media_type', mediaTypes);
      }

      const { data, error } = await searchQuery;
      if (error) throw error;
      return data as Media[];
    },
    enabled: query.length > 0
  });

  // External API search
  const externalSearch = useQuery({
    queryKey: ['external-search', query, mediaTypes],
    queryFn: async () => {
      const results = await searchAllServices(query, mediaTypes);
      return Object.values(results).flat();
    },
    enabled: includeExternal && query.length > 0 && 
      (!localSearch.data || localSearch.data.length < 5)
  });

  return {
    data: [
      ...(localSearch.data || []),
      ...(externalSearch.data || [])
    ],
    isLoading: localSearch.isLoading || externalSearch.isLoading,
    error: localSearch.error || externalSearch.error,
    isError: localSearch.isError || externalSearch.isError
  };
}