'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/client/supabase';
import { Settings, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { EditProfileModal } from './EditProfileModal';

interface ProfileHeaderProps {
  profile: {
    id: string;
    username: string;
    avatar_url?: string;
    bio?: string;
    followers: { count: number };
    following: { count: number };
  };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(profile.followers.count);
  const { user } = useAuth();
  const router = useRouter();
  const isOwnProfile = user?.id === profile.id;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleFollow = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
        setFollowersCount(prev => prev - 1);
      } else {
        await supabase
          .from('followers')
          .insert({
            follower_id: user.id,
            following_id: profile.id,
          });
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
      <div className="relative px-6 pb-6">
        <div className="flex items-end absolute -top-16 space-x-6">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white bg-white">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl text-gray-500">
                  {profile.username[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="pb-4 flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.username}
              </h1>
              {profile.bio && (
                <p className="mt-1 text-gray-500">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-20 flex items-center justify-between">
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {followersCount}
              </div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {profile.following.count}
              </div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
          </div>

          <div className="flex space-x-3">
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  isFollowing
                    ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    : 'border border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
        {isEditModalOpen && (
          <EditProfileModal
            profile={profile}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={() => {
              setIsEditModalOpen(false);
              router.refresh();
            }}
          />
        )}
      </div>
    </div>
  );
}