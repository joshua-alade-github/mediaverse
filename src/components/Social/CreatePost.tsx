import { useState } from 'react';
import { Post } from '@/types';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';

interface CreatePostProps {
  communityId: string;
  onPostCreated: (post: Post) => void;
}

export function CreatePost({ communityId, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          community_id: communityId,
          user_id: user.id,
          content: content.trim(),
        })
        .select('*, user:user_profiles(*)')
        .single();

      if (!error && post) {
        onPostCreated(post);
        setContent('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        rows={3}
      />
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}