import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ActivityTracker } from '@/lib/activity/tracker';

export function withActivity(handler: any) {
  return async (req: NextRequest) => {
    const userId = req.auth?.id;
    if (!userId) return handler(req);

    try {
      const tracker = new ActivityTracker(userId);
      req.activity = tracker;
      const response = await handler(req);

      // Track activities if specified
      if (req.activityEvents) {
        for (const event of req.activityEvents) {
          await tracker.trackActivity(event);
        }
      }

      return response;
    } catch (error) {
      console.error('Activity tracking error:', error);
      return handler(req);
    }
  };
}