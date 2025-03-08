'use client';

import { supabase } from '@/lib/client/supabase';
import { useEffect, useState } from 'react';
import { CreatePost } from './CreatePost';
import { PostsList } from './PostsList';

export function CommunityPosts({ mediaId, mediaType }: { mediaId: string; mediaType: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPosts = async () => {
      if (!mediaId) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Query with both media_id and media_type
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, 
            title, 
            content, 
            created_at, 
            user_id,
            media_id,
            media_type,
            user:user_profiles(
              id, 
              username, 
              avatar_url
            )
          `)
          .eq('media_id', mediaId.toString())
          .eq('media_type', mediaType)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching posts:", error);
        }
        
        if (isMounted) {
          setPosts(data || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error in fetchPosts:", err);
        if (isMounted) {
          setPosts([]);
          setIsLoading(false);
        }
      }
    };
    
    fetchPosts();
    
    return () => {
      isMounted = false;
    };
  }, [mediaId, mediaType]);

  const handlePostCreated = (newPost: any) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading discussions...</div>;
  }

  return (
    <div className="space-y-6">
      <CreatePost 
        mediaId={mediaId}
        mediaType={mediaType}
        onPostCreated={handlePostCreated}
      />
      
      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No discussions yet. Be the first to start a conversation!</p>
        </div>
      ) : (
        <PostsList posts={posts} />
      )}
    </div>
  );
}