'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { MediaType } from '@/types';

interface PopularReviewersProps {
  mediaType: MediaType;
  limit?: number;
}

export function PopularReviewers({ mediaType, limit = 5 }: PopularReviewersProps) {
  const { data: reviewers, isLoading, error } = useQuery({
    queryKey: ['popular-reviewers', mediaType, limit],
    queryFn: () => apiClient.getTopReviewers(mediaType, { limit })
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading reviewers...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading reviewers</div>;
  }

  if (!reviewers || reviewers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviewers found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviewers.map((reviewer) => (
        <Link
          key={reviewer.user.id}
          href={`/profile/${reviewer.user.username}`}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {reviewer.user.avatarUrl && (
              <Image
                src={reviewer.user.avatarUrl}
                alt={reviewer.user.username}
                fill
                className="object-cover"
                sizes="40px"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {reviewer.user.username}
            </div>
            <div className="text-sm text-gray-500">
              {reviewer.reviewCount} reviews
            </div>
          </div>

          <div className="text-right text-sm">
            <div className="font-medium text-gray-900">
              {reviewer.averageRating.toFixed(1)}
            </div>
            <div className="text-gray-500">
              avg rating
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}