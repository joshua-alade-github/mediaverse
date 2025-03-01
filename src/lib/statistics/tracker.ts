import { createClient } from '@/lib/supabase';
import { StatisticsCalculator } from './calculator';

export class StatisticsTracker {
  private supabase = createClient();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async trackEvent(event: {
    type: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    // Store event
    await this.supabase
      .from('analytics_events')
      .insert({
        user_id: this.userId,
        event_type: event.type,
        metadata: event.metadata,
      });

    // Update relevant statistics based on event type
    switch (event.type) {
      case 'media_complete':
      case 'media_rate':
      case 'list_create':
      case 'comment_create':
        await this.recalculateStatistics();
        break;
    }
  }

  private async recalculateStatistics() {
    const calculator = new StatisticsCalculator(this.userId);
    await Promise.all([
      calculator.calculateStatistics('day'),
      calculator.calculateStatistics('week'),
      calculator.calculateStatistics('month'),
    ]);
  }
}