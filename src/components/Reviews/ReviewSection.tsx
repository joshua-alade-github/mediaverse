'use client';

import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/client/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
// Replace with your UI components or create these components
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface ReviewSectionProps {
  mediaId: string;
  mediaType: string; // 'movie', 'tv', 'book', etc.
}

export function ReviewSection({ mediaId, mediaType }: ReviewSectionProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

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
      return data || [];
    },
  });

  // Check if the user has already submitted a review
  const userReview = reviews?.find(review => review.user?.id === user?.id);
  const canSubmitReview = user && !userReview;

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: { 
      media_id: string; 
      media_type: string;
      user_id: string; 
      rating: number; 
      content: string;
      contains_spoilers: boolean;
    }) => {
      const { error, data } = await supabase.from('reviews').insert(reviewData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', mediaId] });
      setRating(0);
      setContent('');
      setContainsSpoilers(false);
    }
  });

  const handleSubmitReview = async () => {
    if (!user || rating === 0) return;
    
    setIsSubmitting(true);
    
    // Use direct Supabase call instead of mutation to debug
    const { error } = await supabase.from('reviews').insert({
      media_id: mediaId,
      media_type: mediaType,
      user_id: user.id,
      rating,
      content,
      contains_spoilers: containsSpoilers
    });
    
    if (error) {
      console.error('Failed to submit review:', error);
      alert(`Error: ${error.message}`);
    } else {
      // Success - reset form and refresh data
      setRating(0);
      setContent('');
      setContainsSpoilers(false);
      queryClient.invalidateQueries({ queryKey: ['reviews', mediaId] });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {canSubmitReview && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
          <div className="flex items-center mb-4">
            {[...Array(10)].map((_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 cursor-pointer ${
                  i < (hoveredRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoveredRating(i + 1)}
                onMouseLeave={() => setHoveredRating(0)}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {hoveredRating || rating || 0}/10
            </span>
          </div>
          <Textarea
            placeholder="Share your thoughts about this title..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-4"
            rows={4}
          />
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="contains-spoilers"
              checked={containsSpoilers}
              onChange={(e) => setContainsSpoilers(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="contains-spoilers" className="ml-2 block text-sm text-gray-900">
              This review contains spoilers
            </label>
          </div>
          <Button 
            onClick={handleSubmitReview} 
            disabled={isSubmitting || rating === 0}
            variant="primary"
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      {userReview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700">
            You've already reviewed this {mediaType}. You can edit your review from your profile.
          </p>
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Reviews {reviews?.length ? `(${reviews.length})` : ''}
      </h3>

      {isLoading ? (
        <div>Loading reviews...</div>
      ) : reviews?.length ? (
        <div className="space-y-6">
          {reviews.map((review) => (
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
                  {review.contains_spoilers && (
                    <div className="mt-2 mb-2">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Contains Spoilers
                      </span>
                    </div>
                  )}
                  {review.content && (
                    <p className="mt-2 text-sm text-gray-600">{review.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}