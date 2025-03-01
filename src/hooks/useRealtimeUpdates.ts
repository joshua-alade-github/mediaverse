import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useRealtimeUpdates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Set up realtime subscriptions for media updates
    const mediaChannel = supabase
      .channel('media-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'media' }, 
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['media'] });
          queryClient.invalidateQueries({ queryKey: ['media', payload.new?.id] });
        }
      )
      .subscribe();

    // Set up realtime subscriptions for lists
    const listsChannel = supabase
      .channel('list-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'lists' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['lists']});
          queryClient.invalidateQueries({ queryKey: ['lists', payload.new?.id]});
        }
      )
      .subscribe();

    // Set up realtime subscriptions for user-specific updates
    const userChannel = supabase
      .channel(`user-${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications']});
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages']});
        }
      )
      .subscribe();

    return () => {
      mediaChannel.unsubscribe();
      listsChannel.unsubscribe();
      userChannel.unsubscribe();
    };
  }, [user, queryClient]);
}