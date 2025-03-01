'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { PostsList } from './PostsList';
import { CreatePost } from './CreatePost';

export function CommunityPosts({ mediaId }: { mediaId: string }) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['media-posts', mediaId],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          user:user_profiles(*),
          likes:post_likes(count),
          comments:comments(count)
        `)
        .eq('media_id', mediaId)
        .order('created_at', { ascending: false });
      return data;
    },
  });

  if (isLoading) return <div>Loading discussions...</div>;

  return (
    <div className="space-y-6">
      <CreatePost mediaId={mediaId} />
      <PostsList posts={posts || []} />
    </div>
  );
}