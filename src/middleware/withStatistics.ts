import type { NextRequest } from 'next/server';
import { StatisticsTracker } from '@/lib/statistics/tracker';

export function withStatistics(handler: any) {
  return async (req: NextRequest) => {
    const userId = req.auth?.id;
    if (!userId) return handler(req);

    try {
      const tracker = new StatisticsTracker(userId);
      req.statistics = tracker;
      const response = await handler(req);

      // Track events if specified
      if (req.statisticsEvents) {
        for (const event of req.statisticsEvents) {
          await tracker.trackEvent(event);
        }
      }

      return response;
    } catch (error) {
      console.error('Statistics tracking error:', error);
      return handler(req);
    }
  };
}