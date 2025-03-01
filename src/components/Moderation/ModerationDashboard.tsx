'use client';

import { useState } from 'react';
import { useModStats } from '@/hooks/useModStats';
import { ModQueue } from './ModQueue';
import { ModStats } from './ModStats';
import { ModHistory } from './ModHistory';

export function ModerationDashboard() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const { stats, isLoading } = useModStats(timeRange);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Moderation Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Pending Reports"
            value={stats?.pendingReports || 0}
            trend={stats?.reportsTrend}
            description="Reports awaiting review"
          />
          <StatCard
            title="Hidden Comments"
            value={stats?.hiddenComments || 0}
            trend={stats?.hiddenTrend}
            description="Comments hidden this period"
          />
          <StatCard
            title="Average Response Time"
            value={`${stats?.avgResponseTime || 0}h`}
            trend={stats?.responseTrend}
            description="Time to resolve reports"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Report Queue</h2>
        </div>
        <ModQueue />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Recent Actions</h2>
          </div>
          <ModHistory />
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">Moderation Trends</h2>
          </div>
          <ModStats timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        </div>
      </div>
    </div>
  );
}