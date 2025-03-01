"use client"

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { Icon } from '@/components/ui/Icon';
import { Progress } from '@/components/ui/Progress';
import { UserAchievement } from '@/lib/achievements/types';

export function AchievementsDisplay() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: achievements, isLoading } = useQuery<UserAchievement[]>({
    queryKey: ['achievements', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('user_achievements')
        .select(`
          *,
          achievement: achievements(*)
        `);

      if (selectedCategory) {
        query = query.eq('achievement.category', selectedCategory);
      }

      const { data, error } = await query;
      
      if (error || !data) {
        return [];
      }

      return data as UserAchievement[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['achievement-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_achievements')
        .select(`
          achievement: achievements(points),
          completed
        `);

      return {
        totalPoints: data
          ?.filter((a) => a.completed)
          .reduce((sum, a) => sum + (a.achievement?.points || 0), 0),
        completedCount: data?.filter((a) => a.completed).length || 0,
        totalCount: data?.length || 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Achievements</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">
              {stats?.totalPoints || 0}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats?.completedCount || 0}
            </div>
            <div className="text-sm text-gray-600">Achievements Earned</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {((stats?.completedCount || 0) / (stats?.totalCount || 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedCategory
                ? 'bg-indigo-100 text-indigo-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {['movies', 'books', 'engagement', 'lists', 'social'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                selectedCategory === category
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div>Loading achievements...</div>
        ) : (
          <div className="grid gap-4">
            {achievements?.map((userAchievement) => (
              <div
                key={userAchievement.id}
                className={`p-4 rounded-lg border ${
                  userAchievement.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-white">
                    <Icon
                      name={userAchievement.achievement?.iconName || "DefaultIcon"}
                      className={userAchievement.completed ? 'text-green-600' : 'text-gray-400'}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {userAchievement.achievement?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {userAchievement.achievement?.description}
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={(userAchievement.progress /
                          userAchievement.achievement?.conditionValue.count) *
                          100}
                        className={userAchievement.completed ? 'bg-green-600' : ''}
                      />
                      <div className="text-sm text-gray-600 mt-1">
                        {userAchievement.progress} /{' '}
                        {userAchievement.achievement?.conditionValue.count}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-indigo-600">
                      {userAchievement.achievement?.points} pts
                    </div>
                    {userAchievement.completed && (
                      <div className="text-sm text-gray-500">
                        {new Date(userAchievement.completedAt || '').toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
