import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

export function useMediaActions(mediaId: string) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const addToList = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          media_id: mediaId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lists']);
      showToast('Added to list', 'success');
    },
    onError: () => {
      showToast('Failed to add to list', 'error');
    },
  });

  const submitReview = useMutation({
    mutationFn: async ({ rating, content }: { rating: number; content?: string }) => {
      const { error } = await supabase
        .from('reviews')
        .upsert({
          user_id: user?.id,
          media_id: mediaId,
          rating,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', mediaId]);
      queryClient.invalidateQueries(['media', mediaId]);
      showToast('Review submitted', 'success');
    },
    onError: () => {
      showToast('Failed to submit review', 'error');
    },
  });

  return {
    addToList,
    submitReview,
  };
}