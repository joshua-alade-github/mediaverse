'use client';

import { useQuery } from '@tanstack/react-query';
import { RecommendationEngine } from '@/lib/recommendations/RecommendationEngine';
import { MediaCard } from '../Media/MediaCard';
import Link from 'next/link';

interface RecommendationsListProps {
  userId: string;
  mediaType?: string;
  limit?: number;
  compact?: boolean;
}

export function RecommendationsList({ 
  userId, 
  mediaType,
  limit = 10, 
  compact = false 
}: RecommendationsListProps) {
  // Use the recommendation engine through React Query
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', userId, mediaType],
    queryFn: async () => {
      const engine = new RecommendationEngine(userId);
      return engine.getRecommendations(mediaType || 'all');
    },
    // Cache recommendations for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <div>Loading recommendations...</div>;
  }

  if (!recommendations?.length) {
    return (
      <div className="text-center text-gray-500">
        No recommendations available
      </div>
    );
  }

  // Limit the number of recommendations if specified
  const displayRecommendations = limit ? recommendations.slice(0, limit) : recommendations;

  if (compact) {
    return (
      <div className="space-y-4">
        {displayRecommendations.map((recommendation) => (
          <Link
            key={recommendation.id}
            href={`/${recommendation.media.media_type}/${recommendation.media.id}`}
            className="block group"
          >
            <div className="flex items-center space-x-3">
              {/* ... compact view rendering ... */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600">
                  {recommendation.media.title}
                </p>
                <p className="text-xs text-gray-500">
                  {recommendation.reason}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                  {Math.round(recommendation.score * 100)}% match
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayRecommendations.map((recommendation) => (
          <div key={recommendation.id} className="flex flex-col">
            <MediaCard media={recommendation.media} />
            <div className="mt-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {recommendation.reason}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                  {Math.round(recommendation.score * 100)}% match
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}