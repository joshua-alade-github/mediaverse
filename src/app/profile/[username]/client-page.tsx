'use client';

import { FollowButton } from '@/components/Social/FollowButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/client/supabase';
import { User } from '@/types';
import { Activity, ArrowLeft, Award, Bookmark, ChartBar, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ClientProfilePageProps {
  username: string;
}

export function ClientProfilePage({ username }: ClientProfilePageProps) {
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ 
    lists: number;
    reviews: number;
    followers: number;
    following: number;
  }>({
    lists: 0,
    reviews: 0,
    followers: 0,
    following: 0
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get the user profile
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (userError) {
          if (userError.code === 'PGRST116') {
            throw new Error('User not found');
          }
          throw userError;
        }

        setProfileUser(userData);

        // Get profile stats (followers, following, lists, reviews)
        const [
          { count: listsCount }, 
          { count: reviewsCount },
          { count: followersCount },
          { count: followingCount }
        ] = await Promise.all([
          supabase.from('lists').select('*', { count: 'exact', head: true }).eq('user_id', userData.id),
          supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userData.id),
          supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', userData.id),
          supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', userData.id)
        ]);

        setStats({
          lists: listsCount || 0,
          reviews: reviewsCount || 0,
          followers: followersCount || 0,
          following: followingCount || 0
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {error || 'User not found'}
        </h2>
        <p className="text-gray-500 mb-6">
          The user you're looking for doesn't exist or the profile is unavailable.
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return Home
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                {profileUser.avatarUrl ? (
                  <img
                    src={profileUser.avatarUrl}
                    alt={profileUser.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-medium">
                    {profileUser.username[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profileUser.username}</h1>
                <p className="text-gray-500">Member since {new Date(profileUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {!isOwnProfile && currentUser && (
              <div className="mt-4 sm:mt-0">
                <FollowButton targetUserId={profileUser.id} />
              </div>
            )}
            
            {isOwnProfile && (
              <Link
                href="/settings"
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit Profile
              </Link>
            )}
          </div>

          {profileUser.bio && (
            <p className="text-gray-700 mb-4">{profileUser.bio}</p>
          )}

          <div className="flex flex-wrap gap-4">
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900">{stats.followers}</span>
              <span className="text-sm text-gray-500">Followers</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900">{stats.following}</span>
              <span className="text-sm text-gray-500">Following</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900">{stats.lists}</span>
              <span className="text-sm text-gray-500">Lists</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-gray-900">{stats.reviews}</span>
              <span className="text-sm text-gray-500">Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="mb-6 bg-white p-1 shadow rounded-lg">
          <TabsTrigger value="activity" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="lists" className="flex items-center">
            <Bookmark className="h-4 w-4 mr-2" />
            Lists
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center">
            <ChartBar className="h-4 w-4 mr-2" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <p className="text-gray-500">Showing recent activity for {profileUser.username}</p>
            
            {/* Placeholder - this would be replaced with actual activity feed component */}
            <div className="py-12 text-center text-gray-500">
              {isOwnProfile ? (
                <>
                  <p>Your activity will appear here</p>
                  <p className="mt-2 text-sm">Start tracking media, creating lists, and writing reviews to see activity</p>
                </>
              ) : (
                <p>No recent activity to display</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lists">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Lists</h2>
              
              {isOwnProfile && (
                <Link
                  href="/lists/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create List
                </Link>
              )}
            </div>
            
            {stats.lists > 0 ? (
              <Link 
                href="/lists" 
                className="block text-indigo-600 hover:text-indigo-800"
              >
                View all lists
              </Link>
            ) : (
              <div className="py-12 text-center text-gray-500">
                {isOwnProfile ? (
                  <>
                    <p>You haven't created any lists yet</p>
                    <Link
                      href="/lists/create"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Create Your First List
                    </Link>
                  </>
                ) : (
                  <p>{profileUser.username} hasn't created any lists yet</p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            
            {stats.reviews > 0 ? (
              <p className="text-gray-500">Showing reviews by {profileUser.username}</p>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <p>
                  {isOwnProfile 
                    ? "You haven't written any reviews yet" 
                    : `${profileUser.username} hasn't written any reviews yet`}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Achievements</h2>
            
            {/* Placeholder for achievements */}
            <div className="py-12 text-center text-gray-500">
              <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>
                {isOwnProfile 
                  ? "You haven't earned any achievements yet" 
                  : `${profileUser.username} hasn't earned any achievements yet`}
              </p>
              <p className="mt-2 text-sm">
                Achievements are earned by tracking media, creating lists, and being active on the platform
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Stats</h2>
            
            {/* Placeholder for stats */}
            <div className="py-12 text-center text-gray-500">
              <ChartBar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>
                {isOwnProfile 
                  ? "No stats to display yet" 
                  : `No stats to display for ${profileUser.username} yet`}
              </p>
              <p className="mt-2 text-sm">
                Stats will appear as you use the platform
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}