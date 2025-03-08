import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import type { MediaReference, Media } from '@/types';

export function useMediaImport() {
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (mediaRef: MediaReference): Promise<Media> => {
      console.log("Starting media import for:", mediaRef);
      
      // First check if already imported
      const { data: existing, error: existingError } = await supabase
        .from('media_external_references')
        .select('media_id')
        .eq('external_id', mediaRef.externalId)
        .eq('external_source', mediaRef.externalSource)
        .maybeSingle();
      
      if (existingError) {
        console.error("Error checking for existing media:", existingError);
      }

      if (existing?.media_id) {
        console.log("Media already imported, id:", existing.media_id);
        // Return existing media
        const { data: media, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .eq('id', existing.media_id)
          .single();
          
        if (mediaError) {
          console.error("Error fetching existing media:", mediaError);
          throw mediaError;
        }
        
        return media;
      }
      
      console.log("Media not found, creating new import job");

      // Start import transaction
      const { data: importJob, error: importJobError } = await supabase
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
        
      if (importJobError) {
        console.error("Error creating import job:", importJobError);
        throw importJobError;
      }

      console.log("Creating new media entry");
      // Create new media entry
      const { data: media, error: mediaError } = await supabase
        .from('media')
        .insert({
          title: mediaRef.title,
          description: mediaRef.description || null,
          media_type: mediaRef.mediaType,
          release_date: mediaRef.releaseDate ? new Date(mediaRef.releaseDate).toISOString() : null,
          cover_image: mediaRef.coverImage || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (mediaError) {
        console.error("Error creating media:", mediaError);
        throw mediaError;
      }

      console.log("Media created:", media);

      if (!media) throw new Error('Failed to create media');

      // Create external reference
      const { error: refError } = await supabase
        .from('media_external_references')
        .insert({
          media_id: media.id,
          external_id: mediaRef.externalId,
          external_source: mediaRef.externalSource,
          reference_data: mediaRef.referenceData || {},
          attribution: mediaRef.attribution || {
            source: mediaRef.externalSource,
            sourceUrl: '',
            timestamp: new Date().toISOString()
          },
          last_fetched: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (refError) {
        console.error("Error creating external reference:", refError);
        throw refError;
      }

      console.log("External reference created");

      // Update import job
      const { error: updateError } = await supabase
        .from('media_import_jobs')
        .update({
          status: 'completed',
          result_media_id: media.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', importJob.id);
        
      if (updateError) {
        console.error("Error updating import job:", updateError);
        // Not throwing here since the media is already created
      }

      console.log("Media import completed successfully");
      return media;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  return {
    importMedia: (media: MediaReference) => importMutation.mutateAsync(media),
    isImporting: importMutation.isPending,
    error: importMutation.error
  };
}