import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';

export function useCommentReports(commentId: string) {
  return useQuery({
    queryKey: ['comment-reports', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comment_reports')
        .select(`
          *,
          reporter:user_profiles(username)
        `)
        .eq('comment_id', commentId);

      if (error) throw error;
      return data;
    },
    enabled: !!commentId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}