import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/server/supabase';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { MediaLists } from '@/components/Profile/MediaLists';
import { ActivityFeed } from '@/components/Profile/ActivityFeed';
import { ReviewHistory } from '@/components/Profile/ReviewHistory';
import { UserStats } from '@/components/Statistics/UserStats';
import { AchievementsDisplay } from '@/components/Achievements/AchievementsDisplay';
import { RecommendationsList } from '@/components/Recommendations/RecommendationsList';

interface ProfilePageProps {
  params: {
    username: string;
  };
  searchParams: {
    tab?: string;
  };
}

export default async function ProfilePage({ 
  params: { username }, 
  searchParams: { tab = 'overview' }
}: ProfilePageProps) {
  const supabase = createServerClient();

  // Fetch user profile with extended data
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      followers:followers!follower_id(count),
      following:followers!following_id(count),
      achievements:user_achievements(
        *,
        achievement:achievements(*)
      ),
      lists:lists(count),
      reviews:reviews(count),
      statistics:user_statistics(
        stats_type,
        time_period,
        data
      )
    `)
    .eq('username', username)
    .single();

  if (error || !profile) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <ProfileHeader profile={profile} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <nav className="flex space-x-4 px-6 py-4 border-b border-gray-200">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'lists', label: 'Lists' },
                { id: 'activity', label: 'Activity' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'achievements', label: 'Achievements' },
                { id: 'stats', label: 'Statistics' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`/profile/${username}?tab=${item.id}`}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    tab === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  {item.id === 'lists' && profile.lists?.count > 0 && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                      {profile.lists.count}
                    </span>
                  )}
                  {item.id === 'achievements' && profile.achievements?.length > 0 && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                      {profile.achievements.length}
                    </span>
                  )}
                </a>
              ))}
            </nav>

            <div className="p-6">
              {tab === 'overview' && (
                <div className="space-y-8">
                  <UserStats userId={profile.id} />
                  <MediaLists userId={profile.id} limit={4} />
                  <ReviewHistory userId={profile.id} limit={4} />
                </div>
              )}
              {tab === 'lists' && <MediaLists userId={profile.id} />}
              {tab === 'activity' && <ActivityFeed userId={profile.id} />}
              {tab === 'reviews' && <ReviewHistory userId={profile.id} />}
              {tab === 'achievements' && <AchievementsDisplay userId={profile.id} />}
              {tab === 'stats' && <UserStats userId={profile.id} detailed />}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity Widget */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <ActivityFeed userId={profile.id} limit={5} compact />
          </div>

          {/* Stats Summary Widget */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Reviews</span>
                <span className="font-medium">{profile.reviews?.count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lists Created</span>
                <span className="font-medium">{profile.lists?.count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Achievements</span>
                <span className="font-medium">{profile.achievements?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Recommendations Widget */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {profile.username}&apos;s Recommendations
            </h3>
            <RecommendationsList userId={profile.id} limit={3} compact />
          </div>
        </div>
      </div>
    </div>
  );
}