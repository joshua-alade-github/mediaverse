import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuth } from '@/hooks/useAuth';

export function useMedia(id: string) {
  return useQuery({
    queryKey: ['media', id],
    queryFn: () => apiClient.getMedia(id),
  });
}

export function useMediaSearch(params: Parameters<typeof apiClient.searchMedia>[0]) {
  return useQuery({
    queryKey: ['media-search', params],
    queryFn: () => apiClient.searchMedia(params),
    enabled: Boolean(params.query || params.mediaTypes?.length),
  });
}

export function useUserLists(userId: string) {
  return useQuery({
    queryKey: ['lists', userId],
    queryFn: () => apiClient.getUserLists(userId),
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: apiClient.createList,
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries(['lists', user.id]);
      }
    },
  });
}

export function useMediaReviews(mediaId: string) {
  return useQuery({
    queryKey: ['reviews', mediaId],
    queryFn: () => apiClient.getMediaReviews(mediaId),
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.submitReview,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['reviews', data.media_id]);
      queryClient.invalidateQueries(['media', data.media_id]);
    },
  });
}

export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => apiClient.getUserStats(userId),
  });
}

export function useRecommendations(userId: string, mediaType?: string) {
  return useQuery({
    queryKey: ['recommendations', userId, mediaType],
    queryFn: () => apiClient.getRecommendations(userId, mediaType),
  });
}