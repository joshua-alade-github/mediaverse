import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { AchievementTracker } from '@/lib/achievements/tracker';

export function useAchievements(userId: string) {
  return useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });
      return data;
    },
  });
}

// Example achievement handler middleware
export function withAchievements(handler: any) {
  return async (req: any, res: any) => {
    const userId = req.auth?.id;
    if (!userId) return handler(req, res);

    try {
      const tracker = new AchievementTracker(userId);
      req.achievements = tracker;
      const result = await handler(req, res);

      // Track events if specified
      if (req.achievementEvents) {
        for (const event of req.achievementEvents) {
          await tracker.trackEvent(event);
        }
      }

      return result;
    } catch (error) {
      console.error('Achievement tracking error:', error);
      return handler(req, res);
    }
  };
}