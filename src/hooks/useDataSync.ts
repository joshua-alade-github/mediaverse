import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export function useDataSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Prefetch user's data
    queryClient.prefetchQuery({
      queryKey: ['user', user.id],
      queryFn: () => fetch(`/api/users/${user.id}`).then((res) => res.json())
    });

    // Prefetch user's lists
    queryClient.prefetchQuery({
      queryKey: ['lists', user.id],
      queryFn: () => fetch(`/api/lists?userId=${user.id}`).then((res) => res.json())
    });

    // Set up periodic data refresh
    const refreshInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }, 30000); // Every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [user, queryClient]);
}