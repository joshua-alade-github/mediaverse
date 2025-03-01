'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { MediaType } from '@/types';

interface PopularListsProps {
  mediaType: MediaType;
  limit?: number;
}

export function PopularLists({ mediaType, limit = 3 }: PopularListsProps) {
  const { data: lists, isLoading, error } = useQuery({
    queryKey: ['popular-lists', mediaType, limit],
    queryFn: () => apiClient.getPopularLists(mediaType, { limit })
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading lists...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading lists</div>;
  }

  if (!lists || lists.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No lists found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lists.map((list) => (
        <Link
          key={list.id}
          href={`/lists/${list.id}`}
          className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="flex -space-x-2 flex-shrink-0">
              {list.list_items.slice(0, 3).map((item) => (
                <div 
                  key={item.media.id}
                  className="relative w-10 h-14 border-2 border-white rounded-md overflow-hidden"
                >
                  {item.media.coverImage ? (
                    <Image
                      src={item.media.coverImage}
                      alt={item.media.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {list.title}
              </h3>
              
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <span>by {list.user.username}</span>
                <span className="mx-2">•</span>
                <span>{list.list_items.length} items</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}