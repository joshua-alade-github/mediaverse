'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { MediaType } from '@/types';

interface CommunityGridProps {
  mediaType: MediaType;
  limit?: number;
}

export function CommunityGrid({ mediaType, limit = 6 }: CommunityGridProps) {
  const { data: communities, isLoading, error } = useQuery({
    queryKey: ['active-communities', mediaType, limit],
    queryFn: () => apiClient.getActiveCommunities(mediaType, { limit })
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading communities...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading communities</div>;
  }

  if (!communities || communities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No communities found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {communities.map((community) => (
        <Link
          key={community.id}
          href={`/communities/${community.id}`}
          className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h3 className="font-medium text-lg text-gray-900 mb-2">
            {community.name}
          </h3>
          
          {community.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {community.description}
            </p>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            <span>{community.members?.count.toLocaleString()} members</span>
          </div>
        </Link>
      ))}
    </div>
  );
}