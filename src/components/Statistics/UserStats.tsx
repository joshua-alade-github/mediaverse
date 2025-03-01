'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface UserStatsProps {
  userId: string;
  detailed?: boolean;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const TIME_PERIODS = ['week', 'month', 'year', 'all'] as const;

export function UserStats({ userId, detailed = false }: UserStatsProps) {
  const [timePeriod, setTimePeriod] = useState<typeof TIME_PERIODS[number]>('month');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', userId, timePeriod],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .eq('time_period', timePeriod)
        .single();
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          Statistics
        </h2>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value as typeof TIME_PERIODS[number])}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Media Items"
          value={stats?.media_consumption?.total_items || 0}
          trend={10} // Example trend value
        />
        <StatCard
          title="Reviews Written"
          value={stats?.engagement?.reviews || 0}
          trend={5}
        />
        <StatCard
          title="Average Rating"
          value={(stats?.engagement?.avg_rating || 0).toFixed(1)}
          suffix="/10"
          trend={0}
        />
      </div>

      {/* Media Type Distribution */}
      <div className={`grid ${detailed ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Media Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(stats?.media_consumption?.by_type || {}).map(([key, value]) => ({
                    name: key.replace('_', ' '),
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {Object.entries(stats?.media_consumption?.by_type || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {detailed && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Rating Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.engagement?.rating_distribution || []}>
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {detailed && (
        <>
          {/* Activity Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Activity Timeline</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.engagement?.activity_timeline || []}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="reviews" stroke="#4F46E5" />
                  <Line type="monotone" dataKey="lists" stroke="#10B981" />
                  <Line type="monotone" dataKey="comments" stroke="#F59E0B" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Stats Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(stats?.detailed_stats || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {key.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {value.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <TrendIndicator value={value.change} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// Helper Components
interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  trend?: number;
}

function StatCard({ title, value, suffix = '', trend = 0 }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">
          {value}{suffix}
        </p>
        {trend !== 0 && (
          <TrendIndicator value={trend} className="ml-2" />
        )}
      </div>
    </div>
  );
}

function TrendIndicator({ value, className = '' }: { value: number; className?: string }) {
  if (value === 0) return null;

  return (
    <span
      className={`inline-flex items-baseline text-sm ${
        value > 0 ? 'text-green-600' : 'text-red-600'
      } ${className}`}
    >
      {value > 0 ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  );
}