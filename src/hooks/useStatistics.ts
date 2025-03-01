import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { StatisticsCalculator } from '@/lib/statistics/calculator';

export function useStatistics(userId: string, period: string = 'month') {
  return useQuery({
    queryKey: ['statistics', userId, period],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_statistics')
        .select('data')
        .eq('user_id', userId)
        .eq('time_period', period)
        .single();

      if (!data) {
        // Calculate statistics if they don't exist
        const calculator = new StatisticsCalculator(userId);
        return calculator.calculateStatistics(period);
      }

      return data.data;
    },
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}