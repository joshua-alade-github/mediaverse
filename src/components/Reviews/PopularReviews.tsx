'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { MediaType } from '@/types';

interface PopularReviewsProps {
  mediaType: MediaType;
  limit?: number;
}

export function PopularReviews({ mediaType, limit = 5 }: PopularReviewsProps) {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['popular-reviews', mediaType, limit],
    queryFn: () => apiClient.getPopularReviews(mediaType, { limit })
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading reviews</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div 
          key={review.id} 
          className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {/* Media Image */}
          <Link 
            href={`/${mediaType}/${review.media.id}`}
            className="flex-shrink-0"
          >
            <div className="relative w-24 h-36 rounded-md overflow-hidden">
              {review.media.coverImage ? (
                <Image
                  src={review.media.coverImage}
                  alt={review.media.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 96px, 96px"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
            </div>
          </Link>

          {/* Review Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-x-4">
              <div>
                <Link 
                  href={`/${mediaType}/${review.media.id}`}
                  className="text-lg font-medium text-gray-900 hover:text-indigo-600 line-clamp-1"
                >
                  {review.media.title}
                </Link>
                <Link
                  href={`/profile/${review.user.username}`}
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Reviewed by {review.user.username}
                </Link>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">
                  {review.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {review.content && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {review.content}
              </p>
            )}

            <div className="mt-2 text-sm text-gray-500">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}