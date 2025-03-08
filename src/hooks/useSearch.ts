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
      if (!query) return [];
      
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
      if (error) {
        console.error('Local search error:', error);
        return [];
      }
      return data as Media[];
    },
    enabled: query.length > 0
  });

  // External API search
  const externalSearch = useQuery({
    queryKey: ['external-search', query, mediaTypes],
    queryFn: async () => {
      if (!query) return [];

      try {
        const results = await searchAllServices(query, mediaTypes);
        
        // Flatten results but make sure to filter by the requested media types
        // This will prevent TV shows search showing movie results
        const allResults = Object.entries(results).flatMap(([type, items]) => {
          // If mediaTypes is specified, only include items of those types
          if (mediaTypes && !mediaTypes.includes(type as MediaType)) {
            return [];
          }
          return items;
        });
        
        return allResults;
      } catch (error) {
        console.error('External search error:', error);
        return [];
      }
    },
    enabled: includeExternal && query.length > 0 && 
      (!localSearch.data || localSearch.data.length < 5)
  });

  // Combine results
  const combinedResults = [
    ...(localSearch.data || []),
    ...(externalSearch.data || [])
  ];

  // Ensure each result has the correct mediaType
  const filteredResults = combinedResults.filter(item => {
    if (!mediaTypes?.length) return true;
    return mediaTypes.includes(item.mediaType);
  });

  return {
    data: filteredResults,
    isLoading: localSearch.isLoading || externalSearch.isLoading,
    error: localSearch.error || externalSearch.error,
    isError: localSearch.isError || externalSearch.isError
  };
}