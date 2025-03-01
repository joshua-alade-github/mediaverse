import { supabase } from '@/lib/client/supabase';
import { Achievement } from './types';

export class AchievementTracker {
  private supabase = supabase;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async trackEvent(event: {
    type: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    // Log the event
    await this.supabase.from('analytics_events').insert({
      user_id: this.userId,
      event_type: event.type,
      metadata: event.metadata,
    });

    // Get relevant achievements for this event type
    const { data: achievements } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('condition_type', event.type);

    if (!achievements?.length) return;

    // Check each achievement
    for (const achievement of achievements) {
      await this.checkAchievement(achievement, event.metadata);
    }
  }

  private async checkAchievement(
    achievement: Achievement,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Get current progress
    const progress = await this.calculateProgress(achievement, metadata);

    // Get or create user achievement
    const { data: userAchievement } = await this.supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', this.userId)
      .eq('achievement_id', achievement.id)
      .single();

    const completed = progress >= 100;

    if (userAchievement) {
      if (!userAchievement.completed && completed) {
        // Achievement newly completed
        await this.completeAchievement(achievement, userAchievement.id);
      } else {
        // Update progress
        await this.supabase
          .from('user_achievements')
          .update({ progress })
          .eq('id', userAchievement.id);
      }
    } else {
      // Create new user achievement
      const { data } = await this.supabase
        .from('user_achievements')
        .insert({
          user_id: this.userId,
          achievement_id: achievement.id,
          progress,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (completed && data) {
        await this.completeAchievement(achievement, data.id);
      }
    }
  }

  private async calculateProgress(
    achievement: Achievement,
    metadata?: Record<string, any>
  ): Promise<number> {
    const { conditionType, conditionValue } = achievement;

    switch (conditionType) {
      case 'review_count': {
        const { count } = await this.supabase
          .from('reviews')
          .select('*', { count: 'exact' })
          .eq('user_id', this.userId);
        return Math.min(100, (count || 0) * 100 / conditionValue.count);
      }
      case 'media_count': {
        const { count } = await this.supabase
          .from('list_items')
          .select('*', { count: 'exact' })
          .eq('user_id', this.userId)
          .eq('media.media_type', conditionValue.media_type);
        return Math.min(100, (count || 0) * 100 / conditionValue.count);
      }
      case 'list_count': {
        const { count } = await this.supabase
          .from('lists')
          .select('*', { count: 'exact' })
          .eq('user_id', this.userId);
        return Math.min(100, (count || 0) * 100 / conditionValue.count);
      }
      case 'follower_count': {
        const { count } = await this.supabase
          .from('followers')
          .select('*', { count: 'exact' })
          .eq('following_id', this.userId);
        return Math.min(100, (count || 0) * 100 / conditionValue.count);
      }
      default:
        return 0;
    }
  }

  private async completeAchievement(
    achievement: Achievement,
    userAchievementId: string
  ): Promise<void> {
    // Update user achievement
    await this.supabase
      .from('user_achievements')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', userAchievementId);

    // Create notification
    await this.supabase.from('notifications').insert({
      user_id: this.userId,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      content: `You've earned the "${achievement.title}" achievement!`,
      metadata: {
        achievement_id: achievement.id,
        points: achievement.points,
      },
    });

    // Update user points
    await this.supabase.rpc('update_user_points', {
      user_id: this.userId,
      points_to_add: achievement.points,
    });
  }
}