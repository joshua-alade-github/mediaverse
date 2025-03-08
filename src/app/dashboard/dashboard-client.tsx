'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/client/supabase';
import Link from 'next/link';
import {
  PlusCircle,
  BarChart2,
  Bookmark,
  Heart,
  Star,
  Film,
  BookOpen,
  Tv,
  Gamepad2,
  Disc,
  Loader2
} from 'lucide-react';

interface ListSummary {
  id: string;
  title: string;
  item_count: number;
}

interface RecentActivity {
  id: string;
  type: string;
  content: any;
  created_at: string;
}

export function DashboardClient() {
  const { user, loading: authLoading } = useAuth();
  const [recentLists, setRecentLists] = useState<ListSummary[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Client-side only code
  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        
        try {
          // Fetch recent lists with item counts
          const { data: listsData } = await supabase
            .from('lists')
            .select(`
              id,
              title,
              item_count:list_items(count)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(4);
            
          if (listsData) {
            setRecentLists(listsData.map(list => ({
              ...list,
              item_count: list.item_count?.length ? list.item_count[0].count : 0
            })));
          }
          
          // Fetch recent activity
          const { data: activityData } = await supabase
            .from('activity')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (activityData) {
            setRecentActivity(activityData);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [user]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'media_add':
        return <PlusCircle className="h-4 w-4 text-green-500" />;
      case 'media_rate':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'media_complete':
        return <Star className="h-4 w-4 text-blue-500" />;
      case 'list_add':
        return <Bookmark className="h-4 w-4 text-indigo-500" />;
      case 'favorite':
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'movie':
        return <Film className="h-8 w-8 text-blue-500" />;
      case 'tv_show':
        return <Tv className="h-8 w-8 text-purple-500" />;
      case 'book':
        return <BookOpen className="h-8 w-8 text-yellow-500" />;
      case 'game':
        return <Gamepad2 className="h-8 w-8 text-green-500" />;
      case 'music':
        return <Disc className="h-8 w-8 text-red-500" />;
      default:
        return <Film className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatActivityText = (activity: RecentActivity) => {
    const { type, content } = activity;
    
    switch (type) {
      case 'media_add':
        return (
          <span>
            Added <span className="font-medium">{content.media_title}</span> to your collection
          </span>
        );
      case 'media_rate':
        return (
          <span>
            Rated <span className="font-medium">{content.media_title}</span> {content.rating}/10
          </span>
        );
      case 'media_complete':
        return (
          <span>
            Completed <span className="font-medium">{content.media_title}</span>
          </span>
        );
      case 'list_add':
        return (
          <span>
            Added <span className="font-medium">{content.media_title}</span> to list "{content.list_title}"
          </span>
        );
      case 'favorite':
        return (
          <span>
            Added <span className="font-medium">{content.media_title}</span> to favorites
          </span>
        );
      default:
        return <span>{JSON.stringify(content)}</span>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Card */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome, {user?.username}!</h2>
              <p className="text-gray-600 mb-4">
                Track your media, create lists, and discover new content all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/lists/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create List
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Search Media
                </Link>
              </div>
            </div>

            {/* Recent Lists */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Lists</h2>
                <Link
                  href="/lists"
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View All
                </Link>
              </div>

              {recentLists.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-base font-medium text-gray-900">No lists yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create lists to organize your media collection.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/lists/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create List
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentLists.map((list) => (
                    <Link
                      key={list.id}
                      href={`/lists/${list.id}`}
                      className="block py-4 hover:bg-gray-50 -mx-6 px-6 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">
                            {list.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        <div className="text-indigo-600">
                          <Bookmark className="h-5 w-5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <Link
                  href={`/profile/${user?.username}?tab=activity`}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View All
                </Link>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart2 className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-base font-medium text-gray-900">No activity yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start tracking media, creating lists, and writing reviews to see your activity.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="mr-3 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            {formatActivityText(activity)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/search"
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <Film className="h-5 w-5 text-indigo-600 mr-3" />
                  <span>Add Media to Collection</span>
                </Link>
                <Link
                  href="/lists/create"
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <Bookmark className="h-5 w-5 text-indigo-600 mr-3" />
                  <span>Create New List</span>
                </Link>
                <Link
                  href={`/profile/${user?.username}`}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <BarChart2 className="h-5 w-5 text-indigo-600 mr-3" />
                  <span>View Your Stats</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <Star className="h-5 w-5 text-indigo-600 mr-3" />
                  <span>Update Profile</span>
                </Link>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Suggested For You</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <Film className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium">Explore Movies</h3>
                    <Link href="/movie" className="text-sm text-indigo-600">
                      View trending movies
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <Tv className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium">Discover TV Shows</h3>
                    <Link href="/tv_show" className="text-sm text-indigo-600">
                      Browse popular series
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <Gamepad2 className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium">Find Games</h3>
                    <Link href="/game" className="text-sm text-indigo-600">
                      See new releases
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}