'use client';

import { useState } from 'react';
import { ReportedComment } from './ReportedComment';

interface ReportedCommentProps {
  comment: ReportedComment;
  onStatusChange: (commentId: string, status: string, reason?: string) => Promise<void>;
}

export function ReportedComment({ comment, onStatusChange }: ReportedCommentProps) {
  const [isResolvingOpen, setIsResolvingOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleResolve = async (status: 'resolved' | 'dismissed') => {
    await onStatusChange(comment.id, status, reason);
    setIsResolvingOpen(false);
    setReason('');
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="space-y-4">
        <div className="flex justify-between">
          <div>
            <span className="font-medium">{comment.user.username}</span>
            <span className="text-gray-500 ml-2">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="text-sm text-red-600">
            {comment.reports.length} reports
          </div>
        </div>

        <p className="text-gray-700">{comment.content}</p>

        <div className="bg-red-50 p-3 rounded">
          <h4 className="text-sm font-medium text-red-800">Report Reasons:</h4>
          <ul className="mt-2 text-sm text-red-700">
            {comment.reports.map((report, index) => (
              <li key={index}>• {report.reason}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsResolvingOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Hide Comment
          </button>
          <button
            onClick={() => handleResolve('dismissed')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Dismiss Report
          </button>
        </div>

        {isResolvingOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Hide Comment</h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for hiding the comment..."
                className="w-full border rounded p-2 mb-4"
                rows={3}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsResolvingOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResolve('resolved')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}