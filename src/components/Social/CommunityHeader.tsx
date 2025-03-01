import { Community } from "@/types";

interface CommunityHeaderProps {
  community: Community;
  isMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

export function CommunityHeader({ 
  community, 
  isMember, 
  onJoin, 
  onLeave 
}: CommunityHeaderProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
          {community.description && (
            <p className="mt-2 text-gray-600">{community.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            {community.members?.count || 0} members
          </p>
        </div>
        <button
          onClick={isMember ? onLeave : onJoin}
          className={`px-4 py-2 rounded-md ${
            isMember 
              ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isMember ? 'Leave' : 'Join'}
        </button>
      </div>
    </div>
  );
}