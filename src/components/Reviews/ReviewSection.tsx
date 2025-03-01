'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function ReviewSection({ mediaId }: { mediaId: string }) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', mediaId],
    queryFn: async () => {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_profiles(*)
        `)
        .eq('media_id', mediaId)
        .order('created_at', { ascending: false });
      return data;
    },
  });

  if (isLoading) return <div>Loading reviews...</div>;

  return (
    <div className="space-y-6">
      {reviews?.map((review) => (
        <div key={review.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <Avatar user={review.user} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Link 
                  href={`/profile/${review.user.username}`}
                  className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                >
                  {review.user.username}
                </Link>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center mt-1">
                {[...Array(10)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {review.rating}/10
                </span>
              </div>
              {review.content && (
                <p className="mt-2 text-sm text-gray-600">{review.content}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}