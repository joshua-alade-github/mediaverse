'use client';

import { useState, useEffect } from 'react';
import { Community, Post, User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { CommunityHeader } from './CommunityHeader';
import { PostsList } from './PostsList';
import { CreatePost } from './CreatePost';

interface CommunityPageProps {
  community: Community;
  initialMembers: User[];
  initialPosts: Post[];
}

export function CommunityPage({ 
  community, 
  initialMembers, 
  initialPosts 
}: CommunityPageProps) {
  const [members, setMembers] = useState(initialMembers);
  const [posts, setPosts] = useState(initialPosts);
  const [isMember, setIsMember] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const checkMembership = async () => {
        const { data } = await supabase
          .from('community_members')
          .select('role')
          .eq('community_id', community.id)
          .eq('user_id', user.id)
          .single();

        setIsMember(!!data);
      };

      checkMembership();
    }
  }, [user, community.id]);

  const handleJoin = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('community_members')
      .insert({
        community_id: community.id,
        user_id: user.id,
      });

    if (!error) {
      setIsMember(true);
      setMembers(prev => [...prev, user]);
    }
  };

  const handleLeave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', community.id)
      .eq('user_id', user.id);

    if (!error) {
      setIsMember(false);
      setMembers(prev => prev.filter(member => member.id !== user.id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <CommunityHeader
        community={community}
        memberCount={members.length}
        isMember={isMember}
        onJoin={handleJoin}
        onLeave={handleLeave}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {isMember && (
            <div className="mb-8">
              <CreatePost
                communityId={community.id}
                onPostCreated={(post) => setPosts(prev => [post, ...prev])}
              />
            </div>
          )}
          <PostsList posts={posts} />
        </div>

        <div className="space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Members</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {members.slice(0, 8).map((member) => (
                <Link
                  key={member.id}
                  href={`/users/${member.username}`}
                  className="flex items-center space-x-2"
                >
                  <Avatar user={member} size="sm" />
                  <span className="text-sm text-gray-700">{member.username}</span>
                </Link>
              ))}
              {members.length > 8 && (
                <Link
                  href={`/communities/${community.id}/members`}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View all members
                </Link>
              )}
            </div>
          </div>

          {community.description && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">About</h3>
              <p className="mt-4 text-sm text-gray-600">{community.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}