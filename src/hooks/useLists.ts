import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import type { List } from '@/types';

export function useLists(userId: string) {
  return useQuery({
    queryKey: ['lists', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as List[];
    },
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (list: Partial<List>) => {
      const { data, error } = await supabase
        .from('lists')
        .insert(list)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['lists', data.user_id]);
    },
  });
}