'use client';

import { useState } from 'react';
import { useReportedComments } from '@/hooks/useReportedComments';
import { ReportedComment } from './ReportedComment';
import { Tabs } from '../ui/Tabs';

const STATUSES = ['pending', 'resolved', 'dismissed'] as const;
type Status = typeof STATUSES[number];

export function ModQueue() {
  const [status, setStatus] = useState<Status>('pending');
  const { comments, isLoading, handleStatusChange } = useReportedComments(status);

  return (
    <div className="space-y-6">
      <Tabs
        value={status}
        onChange={(value) => setStatus(value as Status)}
        items={STATUSES.map((s) => ({
          value: s,
          label: s.charAt(0).toUpperCase() + s.slice(1),
        }))}
      />

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500">No reported comments found.</p>
          ) : (
            comments.map((comment) => (
              <ReportedComment
                key={comment.id}
                comment={comment}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}