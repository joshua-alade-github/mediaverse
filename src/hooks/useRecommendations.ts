import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';

export function useRecommendations(mediaId: string, mediaType: string) {
 return useQuery({
   queryKey: ['recommendations', mediaId, mediaType],
   queryFn: async () => {
     const { data } = await supabase.rpc('get_recommendations', {
       p_media_id: mediaId,
       p_media_type: mediaType,
       p_limit: 5
     });

     return data;
   }
 });
}