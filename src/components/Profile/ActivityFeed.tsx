'use client';

import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

interface ActivityFeedProps {
  userId: string;
  limit?: number;
  compact?: boolean;
}

export function ActivityFeed({ userId, limit, compact = false }: ActivityFeedProps) {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['activity', userId],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = limit || 20;
      const { data } = await supabase
        .from('activity_items')
        .select(`
          *,
          user:user_profiles!user_id(username, avatar_url),
          media:media(*),
          list:lists(*),
          review:reviews(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);
      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage?.length || (limit && pages[0]?.length < limit)) return undefined;
      return pages.length;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (inView && hasNextPage && !limit) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, limit]);

  if (isLoading) {
    return <div>Loading activity...</div>;
  }

  const activities = data?.pages.flat() || [];
  const displayActivities = limit ? activities.slice(0, limit) : activities;

  return (
    <div className={`space-y-${compact ? '2' : '4'}`}>
      {displayActivities.map((activity) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          compact={compact}
        />
      ))}

      {!limit && hasNextPage && (
        <div ref={ref} className="text-center py-4">
          {isFetchingNextPage ? (
            <div>Loading more...</div>
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              Load more
            </button>
          )}
        </div>
      )}

      {activities.length === 0 && (
        <div className="text-center text-gray-500">
          No activity to show
        </div>
      )}
    </div>
  );
}

interface ActivityItemProps {
  activity: any;
  compact: boolean;
}

function ActivityItem({ activity, compact }: ActivityItemProps) {
  const getActivityContent = () => {
    switch (activity.type) {
      case 'review':
        return {
          icon: '⭐️',
          content: (
            <>
              rated{' '}
              <Link
                href={`/${activity.media.media_type}/${activity.media.id}`}
                className="font-medium text-gray-900 hover:text-indigo-600"
              >
                {activity.media.title}
              </Link>{' '}
              <span className="font-medium">{activity.review.rating}/10</span>
            </>
          ),
        };
      case 'list_create':
        return {
          icon: '📋',
          content: (
            <>
              created a new list{' '}
              <Link
                href={`/lists/${activity.list.id}`}
                className="font-medium text-gray-900 hover:text-indigo-600"
              >
                {activity.list.title}
              </Link>
            </>
          ),
        };
      case 'list_update':
        return {
          icon: '📝',
          content: (
            <>
              updated their list{' '}
              <Link
                href={`/lists/${activity.list.id}`}
                className="font-medium text-gray-900 hover:text-indigo-600"
              >
                {activity.list.title}
              </Link>
            </>
          ),
        };
      case 'achievement':
        return {
          icon: '🏆',
          content: (
            <>
              earned the achievement{' '}
              <span className="font-medium text-gray-900">
                {activity.metadata.achievement_title}
              </span>
            </>
          ),
        };
      default:
        return {
          icon: '📣',
          content: activity.content,
        };
    }
  };

  const { icon, content } = getActivityContent();

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span>{icon}</span>
        <span className="flex-1 text-gray-600">
          {content}
        </span>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </span>
      </div>
    );
  }

  return (
    <div className="flex space-x-3">
      <div className="flex-shrink-0">
        <Link href={`/profile/${activity.user.username}`}>
        {activity.user.avatar_url ? (
            <img
              src={activity.user.avatar_url}
              alt={activity.user.username}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-600">
                {activity.user.username[0].toUpperCase()}
              </span>
            </div>
          )}
        </Link>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">
          <Link
            href={`/profile/${activity.user.username}`}
            className="font-medium text-gray-900 hover:text-indigo-600"
          >
            {activity.user.username}
          </Link>{' '}
          {content}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}