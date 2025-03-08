'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import { UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
}

export function FollowButton({ targetUserId, initialIsFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Check if already following when component mounts
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_follows')
          .select('*')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .maybeSingle();
        
        if (error) throw error;
        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };
    
    checkFollowStatus();
  }, [user, targetUserId]);
  
  // Don't render button if viewing own profile
  if (user?.id === targetUserId) {
    return null;
  }
  
  // Don't render button if not logged in
  if (!user) {
    return null;
  }
  
  const handleFollow = async () => {
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        
        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
        setIsFollowing(true);
        
        // Create notification for followed user
        await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            type: 'follow',
            content: `${user.username} started following you`,
            related_id: user.id,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
        isFollowing
          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}