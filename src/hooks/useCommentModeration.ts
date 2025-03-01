import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';

export function useCommentModeration() {
  const queryClient = useQueryClient();

  const hideComment = useMutation({
    mutationFn: async ({
      commentId,
      reason,
    }: {
      commentId: string;
      reason: string;
    }) => {
      const { data, error } = await supabase
        .from('comments')
        .update({
          is_hidden: true,
          hidden_reason: reason,
          moderated_at: new Date().toISOString(),
        })
        .eq('id', commentId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments']});
      queryClient.invalidateQueries({ queryKey: ['reported-comments']});
    },
  });

  const resolveReport = useMutation({
    mutationFn: async ({
      reportId,
      status,
      moderatorNotes,
    }: {
      reportId: string;
      status: 'resolved' | 'dismissed';
      moderatorNotes?: string;
    }) => {
        const { data, error } = await supabase
        .from('comment_reports')
        .update({
          status,
          resolved_at: new Date().toISOString(),
          moderator_notes: moderatorNotes,
        })
        .eq('id', reportId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reported-comments']});
    },
  });

  return {
    hideComment,
    resolveReport,
  };
}