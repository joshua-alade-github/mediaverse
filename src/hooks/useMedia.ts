import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import type { Media } from '@/types';

export function useMedia(id: string) {
  return useQuery({
    queryKey: ['media', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media')
        .select(`
          *,
          genres (name),
          reviews (
            rating,
            content,
            created_at,
            user_profiles (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Media;
    },
  });
}

export function useMediaList(type?: string, genre?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['media-list', type, genre],
    queryFn: async () => {
      let query = supabase
        .from('media')
        .select('*, genres (name)');

      if (type) {
        query = query.eq('media_type', type);
      }

      if (genre) {
        query = query.eq('genres.name', genre);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Media[];
    },
  });
}