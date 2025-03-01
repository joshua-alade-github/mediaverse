'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCommentActions } from '@/hooks/useCommentActions';
import { Avatar } from '../ui/Avatar';
import { CommentForm } from './CommentForm';
import { CommentMenu } from './CommentMenu';
import { timeAgo } from '@/utils/date';

interface CommentProps {
  comment: Comment;
  mediaId: string;
}

export function Comment({ comment, mediaId }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const { user } = useAuth();
  const { addReaction, removeReaction, reportComment } = useCommentActions(comment.id);

  const handleReaction = (type: string) => {
    if (comment.reactions.find(r => r.userId === user?.id)) {
      removeReaction(type);
    } else {
      addReaction(type);
    }
  };

  const handleReport = async (reason: string) => {
    try {
      await reportComment(reason);
    } catch (error) {
      console.error('Failed to report comment:', error);
    }
  };

  if (comment.isHidden && !user?.isModernator) {
    return (
      <div className="p-4 bg-gray-50 rounded-md text-gray-500 italic">
        This comment has been hidden by a moderator.
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="flex space-x-3">
        <Avatar user={comment.user} size="sm" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {comment.user.username}
              </span>
              <span className="text-sm text-gray-500">
                {timeAgo(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-500">(edited)</span>
              )}
            </div>
            
            <CommentMenu
              comment={comment}
              onReport={handleReport}
            />
          </div>

          <div className="text-sm text-gray-700">
            {comment.content}
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => handleReaction('like')}
              className={`flex items-center space-x-1 ${
                comment.reactions.some(r => r.userId === user?.id && r.type === 'like')
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>👍</span>
              <span>{comment.reactions.filter(r => r.type === 'like').length}</span>
            </button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-gray-500 hover:text-gray-700"
            >
              Reply
            </button>

            {comment.replyCount > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replyCount} replies
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-4">
              <CommentForm
                mediaId={mediaId}
                parentId={comment.id}
                onSuccess={() => setIsReplying(false)}
              />
            </div>
          )}

          {showReplies && comment.replies && (
            <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-100">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  mediaId={mediaId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}