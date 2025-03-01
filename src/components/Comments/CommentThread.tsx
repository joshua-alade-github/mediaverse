'use client';

import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { Comment } from './Comment';
import { CommentForm } from './CommentForm';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface CommentThreadProps {
  mediaId: string;
}

export function CommentThread({ mediaId }: CommentThreadProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const { comments, isLoading, fetchNextPage, hasNextPage } = useComments(mediaId, sortBy);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Discussion</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      <CommentForm mediaId={mediaId} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              mediaId={mediaId}
            />
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-500"
        >
          Load more comments
        </button>
      )}
    </div>
  );
}