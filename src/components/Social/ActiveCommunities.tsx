import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import type { Community } from '@/types';

async function getActiveCommunities(): Promise<Community[]> {
  const communities = await apiClient.getActiveCommunities(5);
  
  return communities.map(community => ({
    id: community.id,
    name: community.name,
    description: community.description ?? undefined,
    members: {
      count: community._count.community_members
    },
    createdBy: community.created_by,
    mediaType: community.media_type ?? undefined,
    isPrivate: community.is_private,
    createdAt: new Date(community.created_at)
  }));
}

export async function ActiveCommunities() {
  const communities = await getActiveCommunities();

  return (
    <div className="space-y-4">
      {communities.map((community) => (
        <Link
          key={community.id}
          href={`/community/${community.id}`}
          className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {community.name}
              </h3>
              {community.mediaType && (
                <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                  {community.mediaType.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            
            {community.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {community.description}
              </p>
            )}
            
            <p className="text-sm text-gray-500">
              {community.members.count.toLocaleString()} members
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}