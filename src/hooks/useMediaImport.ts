import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { MediaReference, Media } from '@/types';

export function useMediaImport() {
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (mediaRef: MediaReference): Promise<Media> => {
      // First check if already imported
      const { data: existing } = await apiClient.supabase
        .from('media_external_references')
        .select('media_id')
        .eq('external_id', mediaRef.externalId)
        .eq('external_source', mediaRef.externalSource)
        .maybeSingle();

      if (existing?.media_id) {
        // Return existing media
        const { data: media } = await apiClient.supabase
          .from('media')
          .select('*')
          .eq('id', existing.media_id)
          .single();
          
        return media;
      }

      // Start import transaction
      const { data: importJob } = await apiClient.supabase
        .from('media_import_jobs')
        .insert({
          external_id: mediaRef.externalId,
          external_source: mediaRef.externalSource,
          status: 'pending',
          metadata: {
            title: mediaRef.title,
            mediaType: mediaRef.mediaType
          }
        })
        .select()
        .single();

      // Create new media entry
      const { data: media } = await apiClient.supabase
        .from('media')
        .insert({
          title: mediaRef.title,
          description: mediaRef.description,
          media_type: mediaRef.mediaType,
          release_date: mediaRef.releaseDate?.toISOString(),
          cover_image: mediaRef.coverImage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!media) throw new Error('Failed to create media');

      // Create external reference
      await apiClient.supabase
        .from('media_external_references')
        .insert({
          media_id: media.id,
          external_id: mediaRef.externalId,
          external_source: mediaRef.externalSource,
          reference_data: mediaRef.referenceData,
          attribution: mediaRef.attribution
        });

      // Update import job
      await apiClient.supabase
        .from('media_import_jobs')
        .update({
          status: 'completed',
          result_media_id: media.id
        })
        .eq('id', importJob.id);

      return media;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  return {
    importMedia: importMutation.mutate,
    isImporting: importMutation.isPending,
    error: importMutation.error
  };
}