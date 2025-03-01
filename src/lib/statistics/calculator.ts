import { createClient } from '@/lib/supabase';
import { startOfDay, subDays, format } from 'date-fns';

export class StatisticsCalculator {
  private supabase = createClient();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async calculateStatistics(timePeriod: string = 'all'): Promise<UserStatistics> {
    const startDate = this.getStartDate(timePeriod);

    const [
      mediaStats,
      engagementStats,
      socialStats,
    ] = await Promise.all([
      this.calculateMediaStats(startDate),
      this.calculateEngagementStats(startDate),
      this.calculateSocialStats(startDate),
    ]);

    // Store the calculated statistics
    await this.storeStatistics({
      ...mediaStats,
      ...engagementStats,
      ...socialStats,
      time_period: timePeriod,
    });

    return {
      mediaConsumption: mediaStats,
      engagement: engagementStats,
      social: socialStats,
    };
  }

  private getStartDate(timePeriod: string): Date | null {
    switch (timePeriod) {
      case 'day':
        return startOfDay(subDays(new Date(), 1));
      case 'week':
        return startOfDay(subDays(new Date(), 7));
      case 'month':
        return startOfDay(subDays(new Date(), 30));
      case 'year':
        return startOfDay(subDays(new Date(), 365));
      default:
        return null;
    }
  }

  private async calculateMediaStats(startDate: Date | null) {
    let query = this.supabase
      .from('list_items')
      .select(`
        *,
        media!inner(
          media_type,
          runtime
        )
      `)
      .eq('user_id', this.userId);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: items } = await query;

    // Calculate media type distribution
    const byType: Record<string, number> = {};
    let totalTime = 0;

    items?.forEach((item) => {
      const mediaType = item.media.media_type;
      byType[mediaType] = (byType[mediaType] || 0) + 1;
      totalTime += item.media.runtime || 0;
    });

    // Calculate average rating
    const { data: ratings } = await this.supabase
      .from('reviews')
      .select('rating')
      .eq('user_id', this.userId);

    const averageRating = ratings?.length
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    return {
      totalItems: items?.length || 0,
      byType,
      totalTime,
      averageRating,
    };
  }

  private async calculateEngagementStats(startDate: Date | null) {
    // Get review statistics
    let reviewQuery = this.supabase
      .from('reviews')
      .select('*')
      .eq('user_id', this.userId);

    if (startDate) {
      reviewQuery = reviewQuery.gte('created_at', startDate.toISOString());
    }

    const { data: reviews } = await reviewQuery;

    // Calculate rating distribution
    const ratingDistribution: Record<number, number> = {};
    reviews?.forEach((review) => {
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
    });

    // Get activity timeline
    const activityTimeline = await this.getActivityTimeline(startDate);

    return {
      reviews: reviews?.length || 0,
      comments: await this.getCommentCount(startDate),
      listsCreated: await this.getListCount(startDate),
      avgRating: reviews?.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
      ratingDistribution,
      activityTimeline,
    };
  }

  private async calculateSocialStats(startDate: Date | null) {
    // Get follower counts
    const { data: followers } = await this.supabase
      .from('followers')
      .select('count')
      .eq('following_id', this.userId);

    const { data: following } = await this.supabase
      .from('followers')
      .select('count')
      .eq('follower_id', this.userId);

    // Get interaction count (comments, likes, etc.)
    let interactionQuery = this.supabase
      .from('analytics_events')
      .select('count')
      .eq('user_id', this.userId)
      .in('event_type', ['comment', 'like', 'share']);

    if (startDate) {
      interactionQuery = interactionQuery.gte('created_at', startDate.toISOString());
    }

    const { count: interactions } = await interactionQuery;

    return {
      followers: followers?.[0]?.count || 0,
      following: following?.[0]?.count || 0,
      interactions: interactions || 0,
    };
  }

  private async getActivityTimeline(startDate: Date | null) {
    const days = startDate ? Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 30;
    const timeline = [];

    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const [reviews, lists, comments] = await Promise.all([
        this.getCountForDate('reviews', dateStr),
        this.getCountForDate('lists', dateStr),
        this.getCountForDate('comments', dateStr),
      ]);

      timeline.push({
        date: dateStr,
        reviews,
        lists,
        comments,
      });
    }

    return timeline.reverse();
  }

  private async getCountForDate(table: string, date: string): Promise<number> {
    const { count } = await this.supabase
      .from(table)
      .select('count')
      .eq('user_id', this.userId)
      .gte('created_at', `${date}T00:00:00Z`)
      .lt('created_at', `${date}T23:59:59Z`);

    return count || 0;
  }

  private async getCommentCount(startDate: Date | null) {
    let query = this.supabase
      .from('comments')
      .select('count')
      .eq('user_id', this.userId);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { count } = await query;
    return count || 0;
  }

  private async getListCount(startDate: Date | null) {
    let query = this.supabase
      .from('lists')
      .select('count')
      .eq('user_id', this.userId);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { count } = await query;
    return count || 0;
  }

  private async storeStatistics(stats: any) {
    await this.supabase
      .from('user_statistics')
      .upsert({
        user_id: this.userId,
        data: stats,
        updated_at: new Date().toISOString(),
      });
  }
}