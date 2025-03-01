import { supabase } from '@/lib/client/supabase';
import { AchievementTracker } from '../achievements/tracker';
import { StatisticsTracker } from '../statistics/tracker';
import { ActivityType } from './types';

export class ActivityTracker {
  private supabase = supabase;
  private userId: string;
  private achievementTracker: AchievementTracker;
  private statisticsTracker: StatisticsTracker;

  constructor(userId: string) {
    this.userId = userId;
    this.achievementTracker = new AchievementTracker(userId);
    this.statisticsTracker = new StatisticsTracker(userId);
  }

  async trackActivity(activity: {
    type: ActivityType;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      // Record the activity
      const { error } = await this.supabase
        .from('activity_items')
        .insert({
          user_id: this.userId,
          type: activity.type,
          content: activity.content,
          metadata: activity.metadata || {},
        });

      if (error) throw error;

      // Track for achievements
      await this.achievementTracker.trackEvent({
        type: activity.type,
        metadata: activity.metadata
      });

      // Track for statistics
      await this.statisticsTracker.trackEvent({
        type: activity.type,
        metadata: activity.metadata,
      });

      // Create notifications for relevant activities
      await this.createNotifications(activity);

    } catch (error) {
      console.error('Error tracking activity:', error);
      throw error;
    }
  }

  private async createNotifications(activity: {
    type: ActivityType;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    switch (activity.type) {
      case 'follow_user': {
        // Notify the followed user
        await this.supabase.from('notifications').insert({
          user_id: activity.metadata?.targetUserId,
          type: 'follow',
          content: `${activity.metadata?.username} started following you`,
          metadata: {
            follower_id: this.userId,
            follower_username: activity.metadata?.username,
          },
        });
        break;
      }
      case 'comment_create': {
        if (activity.metadata?.parentUserId && activity.metadata.parentUserId !== this.userId) {
          // Notify the parent comment author
          await this.supabase.from('notifications').insert({
            user_id: activity.metadata.parentUserId,
            type: 'comment_reply',
            content: `${activity.metadata?.username} replied to your comment`,
            metadata: {
              comment_id: activity.metadata?.commentId,
              media_id: activity.metadata?.mediaId,
            },
          });
        }
        break;
      }
      case 'media_review': {
        // Notify users following the reviewer
        const { data: followers } = await this.supabase
          .from('followers')
          .select('follower_id')
          .eq('following_id', this.userId);

        if (followers) {
          const notifications = followers.map(({ follower_id }) => ({
            user_id: follower_id,
            type: 'review',
            content: `${activity.metadata?.username} reviewed ${activity.metadata?.mediaTitle}`,
            metadata: {
              review_id: activity.metadata?.reviewId,
              media_id: activity.metadata?.mediaId,
            },
          }));

          await this.supabase.from('notifications').insert(notifications);
        }
        break;
      }
    }
  }
}