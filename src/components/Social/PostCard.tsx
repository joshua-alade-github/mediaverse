import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/client/supabase';
import { ExtendedPost, Post } from '@/types/index';
import { timeAgo } from '@/utils/time';
import { Menu } from '@headlessui/react';
import {
  MessageSquare as ChatAltIcon,
  MoreVertical as DotsVerticalIcon,
  Share as ShareIcon,
  ThumbsUp as ThumbUpIcon
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Avatar } from './Avatar';

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [likes, setLikes] = useState<string[]>([]);
  
  // Cast post to ExtendedPost to ensure commentCount is available
  const extendedPost = post as ExtendedPost;

  useEffect(() => {
    const fetchLikes = async () => {
      const { data } = await supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', post.id);

      if (data) {
        setLikes(data.map(like => like.user_id));
      }
    };

    fetchLikes();
  }, [post.id]);

  const handleLike = async () => {
    if (!user) return;

    const isLiked = likes.includes(user.id);
    if (isLiked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id);
      setLikes(prev => prev.filter(id => id !== user.id));
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: post.id, user_id: user.id });
      setLikes(prev => [...prev, user.id]);
    }
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('posts')
      .update({ content })
      .eq('id', post.id);

    if (!error) {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar user={extendedPost.user} />
          <div>
            <Link href={`/users/${extendedPost.user.username}`} className="font-medium text-gray-900">
              {extendedPost.user.username}
            </Link>
            <p className="text-sm text-gray-500">
              {timeAgo(post.createdAt)}
              {post.createdAt !== post.updatedAt && ' (edited)'}
            </p>
          </div>
        </div>
        {user?.id === post.userId && (
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 hover:bg-gray-100 rounded-full">
              <DotsVerticalIcon className="h-5 w-5 text-gray-400" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                  >
                    Edit
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onDelete}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } block px-4 py-2 text-sm text-red-600 w-full text-left`}
                  >
                    Delete
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )}
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-900">{content}</p>
        )}
      </div>

      <div className="mt-4 flex items-center space-x-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 ${
            user && likes.includes(user.id)
              ? 'text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ThumbUpIcon className="h-5 w-5" />
          <span>{likes.length}</span>
        </button>
        <button
          onClick={() => {/* Open comments */}}
          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
        >
          <ChatAltIcon className="h-5 w-5" />
          <span>{extendedPost.commentCount}</span>
        </button>
        <button
          onClick={() => {/* Share post */}}
          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
        >
          <ShareIcon className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}