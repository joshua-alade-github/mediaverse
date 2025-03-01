'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { Star, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ReviewHistoryProps {
  userId: string;
  limit?: number;
}

export function ReviewHistory({ userId, limit }: ReviewHistoryProps) {
  const [page, setPage] = useState(1);
  const [selectedMediaType, setSelectedMediaType] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const itemsPerPage = limit || 10;

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', userId, page, itemsPerPage, selectedMediaType],
    queryFn: async () => {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      let query = supabase
        .from('reviews')
        .select(`
          *,
          media(
            id,
            title,
            media_type,
            cover_image
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (selectedMediaType) {
        query = query.eq('media.media_type', selectedMediaType);
      }

      const { data: reviews } = await query.range(start, end);

      // Get total count for pagination
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .condition('media_type', selectedMediaType ? 'eq' : 'neq', selectedMediaType);

      return {
        reviews,
        totalCount: count || 0,
      };
    },
  });

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  if (isLoading) {
    return <div>Loading reviews...</div>;
  }

  if (!data?.reviews?.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-500">Start rating and reviewing your favorite media!</p>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Reviews</h3>
        <select
          value={selectedMediaType || ''}
          onChange={(e) => {
            setSelectedMediaType(e.target.value || null);
            setPage(1);
          }}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="">All Types</option>
          <option value="movie">Movies</option>
          <option value="tv_show">TV Shows</option>
          <option value="book">Books</option>
          <option value="game">Games</option>
        </select>
      </div>

      <div className="space-y-4">
        {data.reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-24 relative rounded overflow-hidden">
                    {review.media.cover_image ? (
                      <img
                        src={review.media.cover_image}
                        alt={review.media.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/${review.media.media_type}/${review.media.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {review.media.title}
                      </Link>
                      <div className="flex items-center mt-1">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {review.rating}/10
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  {review.content && (
                    <div className="mt-2">
                      <div
                        className={`text-gray-600 text-sm ${
                          !expandedReviews.has(review.id) && 'line-clamp-3'
                        }`}
                      >
                        {review.content}
                      </div>
                      {review.content.length > 150 && (
                        <button
                          onClick={() => toggleReviewExpansion(review.id)}
                          className="mt-1 text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                        >
                          {expandedReviews.has(review.id) ? 'Show less' : 'Read more'}
                          <ChevronDown
                            className={`h-4 w-4 ml-1 transform ${
                              expandedReviews.has(review.id) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!limit && totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}