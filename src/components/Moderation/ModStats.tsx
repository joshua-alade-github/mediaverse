import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ModStatsProps {
  timeRange: 'day' | 'week' | 'month';
  onTimeRangeChange: (range: 'day' | 'week' | 'month') => void;
}

export function ModStats({ timeRange, onTimeRangeChange }: ModStatsProps) {
  const { data: stats, isLoading } = useModerationStats(timeRange);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as typeof timeRange)}
          className="rounded-md border-gray-300"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats?.timeSeriesData}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="reports"
              stroke="#4F46E5"
              name="Reports"
            />
            <Line
              type="monotone"
              dataKey="actions"
              stroke="#10B981"
              name="Actions Taken"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Common Report Reasons</div>
          <ul className="mt-2 space-y-2">
            {stats?.topReasons.map((reason) => (
              <li key={reason.name} className="flex justify-between">
                <span>{reason.name}</span>
                <span className="font-medium">{reason.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Action Distribution</div>
          <ul className="mt-2 space-y-2">
            {stats?.actionTypes.map((action) => (
              <li key={action.type} className="flex justify-between">
                <span>{action.type}</span>
                <span className="font-medium">{action.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}