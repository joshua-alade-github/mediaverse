import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchAllServices, getMediaDetails, getServiceForType } from '@/lib/services/media';
import { apiClient } from '@/lib/api/client';
import type { MediaType, MediaReference, Media } from '@/types';

interface UseExternalMediaOptions {
  includeLocal?: boolean;
  mediaTypes?: MediaType[];
}

export function useExternalMedia() {
  const queryClient = useQueryClient();

  const search = (query: string, options: UseExternalMediaOptions = {}) => {
    return useQuery({
      queryKey: ['external-search', query, options],
      queryFn: async () => {
        const results = await searchAllServices(query, options.mediaTypes);
        
        if (options.includeLocal) {
          // Combine with local results
          const localResults = await apiClient.searchMedia({
            query,
            mediaTypes: options.mediaTypes
          });
          
          // TODO: Merge results
        }
        
        return results;
      },
      enabled: query.length > 0
    });
  };

  const getDetails = (mediaType: MediaType, externalId: string) => {
    return useQuery({
      queryKey: ['external-media', mediaType, externalId],
      queryFn: () => getMediaDetails(mediaType, externalId)
    });
  };

  // Mutation to import external media to local database
  const importMutation = useMutation({
    mutationFn: async (media: MediaReference) => {
      // First check if it already exists
      const existing = await apiClient.supabase
        .from('media')
        .select('id')
        .eq('external_id', media.externalId)
        .eq('external_source', media.externalSource)
        .maybeSingle();

      if (existing.data) {
        return existing.data;
      }

      // Create new media entry
      const { data: newMedia } = await apiClient.supabase
        .from('media')
        .insert({
          title: media.title,
          description: media.description,
          media_type: media.mediaType,
          release_date: media.releaseDate?.toISOString(),
          cover_image: media.coverImage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!newMedia) throw new Error('Failed to create media');

      // Create external reference
      await apiClient.supabase
        .from('media_external_references')
        .insert({
          media_id: newMedia.id,
          external_id: media.externalId,
          external_source: media.externalSource,
          reference_data: media.referenceData,
          attribution: media.attribution,
          last_fetched: new Date().toISOString()
        });

      return newMedia;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  return {
    search,
    getDetails,
    importMedia: importMutation.mutate,
    isImporting: importMutation.isPending
  };
}