'use client';

import { PostCard } from './PostCard';
import { Post } from '@/types';

interface PostsListProps {
  posts: Post[];
}

export function PostsList({ posts }: PostsListProps) {
  if (!posts?.length) {
    return <div>No posts yet</div>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}