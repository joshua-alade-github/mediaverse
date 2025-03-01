import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import type { Review } from '@/types';

export function useReviews(mediaId: string) {
  return useQuery({
    queryKey: ['reviews', mediaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user_profiles (
            username,
            avatar_url
          )
        `)
        .eq('media_id', mediaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: Partial<Review>) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.media_id]});
      queryClient.invalidateQueries({ queryKey: ['media', data.media_id]});
    },
  });
}