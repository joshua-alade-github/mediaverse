'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';

interface LikeButtonProps {
  contentId: string;
  contentType: 'post' | 'review' | 'comment';
  initialLikes?: number;
  initialDislikes?: number;
  initialUserReaction?: 'like' | 'dislike' | null;
}

export function LikeButton({
  contentId,
  contentType,
  initialLikes = 0,
  initialDislikes = 0,
  initialUserReaction = null
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(initialUserReaction);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const getTableName = () => {
    switch (contentType) {
      case 'post':
        return 'post_reactions';
      case 'review':
        return 'review_reactions';
      case 'comment':
        return 'comment_reactions';
      default:
        return 'post_reactions';
    }
  };

  const getContentColumn = () => {
    switch (contentType) {
      case 'post':
        return 'post_id';
      case 'review':
        return 'review_id';
      case 'comment':
        return 'comment_id';
      default:
        return 'post_id';
    }
  };

  const handleReaction = async (reaction: 'like' | 'dislike') => {
    if (!user) return;

    setIsLoading(true);

    const tableName = getTableName();
    const contentColumn = getContentColumn();

    try {
      if (userReaction === reaction) {
        // Remove reaction
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('user_id', user.id)
          .eq(contentColumn, contentId);

        if (error) throw error;

        setUserReaction(null);
        
        if (reaction === 'like') {
          setLikes(prev => Math.max(0, prev - 1));
        } else {
          setDislikes(prev => Math.max(0, prev - 1));
        }
      } else {
        // First remove any existing reaction
        if (userReaction) {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('user_id', user.id)
            .eq(contentColumn, contentId);

          if (error) throw error;

          // Update counts
          if (userReaction === 'like') {
            setLikes(prev => Math.max(0, prev - 1));
          } else {
            setDislikes(prev => Math.max(0, prev - 1));
          }
        }

        // Add new reaction
        const { error } = await supabase
          .from(tableName)
          .insert({
            user_id: user.id,
            [contentColumn]: contentId,
            reaction_type: reaction,
            created_at: new Date().toISOString()
          });

        if (error) throw error;

        // Update the reaction counts
        if (reaction === 'like') {
          setLikes(prev => prev + 1);
        } else {
          setDislikes(prev => prev + 1);
        }

        setUserReaction(reaction);
        
        // Create notification for the content owner
        // We need to get the owner first
        let ownerId;
        if (contentType === 'post') {
          const { data } = await supabase
            .from('posts')
            .select('user_id')
            .eq('id', contentId)
            .single();
          ownerId = data?.user_id;
        } else if (contentType === 'review') {
          const { data } = await supabase
            .from('reviews')
            .select('user_id')
            .eq('id', contentId)
            .single();
          ownerId = data?.user_id;
        } else if (contentType === 'comment') {
          const { data } = await supabase
            .from('comments')
            .select('user_id')
            .eq('id', contentId)
            .single();
          ownerId = data?.user_id;
        }
        
        // Don't notify yourself
        if (ownerId && ownerId !== user.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: ownerId,
              type: reaction === 'like' ? 'like' : 'dislike',
              content: `${user.username} ${reaction === 'like' ? 'liked' : 'disliked'} your ${contentType}`,
              related_id: contentId,
              created_at: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => handleReaction('like')}
        disabled={isLoading}
        className={`flex items-center space-x-1 ${
          userReaction === 'like' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
        }`}
      >
        <ThumbsUp
          className={`h-5 w-5 ${userReaction === 'like' ? 'fill-blue-100' : ''}`}
        />
        <span>{likes}</span>
      </button>

      <button
        onClick={() => handleReaction('dislike')}
        disabled={isLoading}
        className={`flex items-center space-x-1 ${
          userReaction === 'dislike' ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
        }`}
      >
        <ThumbsDown
          className={`h-5 w-5 ${userReaction === 'dislike' ? 'fill-red-100' : ''}`}
        />
        <span>{dislikes}</span>
      </button>
    </div>
  );
}