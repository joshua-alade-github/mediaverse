export interface UserStatistics {
    mediaConsumption: {
      totalItems: number;
      byType: Record<string, number>;
      totalTime: number;
      averageRating: number;
    };
    engagement: {
      reviews: number;
      comments: number;
      listsCreated: number;
      avgRating: number;
      ratingDistribution: Record<number, number>;
      activityTimeline: Array<{
        date: string;
        reviews: number;
        lists: number;
        comments: number;
      }>;
    };
    social: {
      followers: number;
      following: number;
      interactions: number;
    };
  }