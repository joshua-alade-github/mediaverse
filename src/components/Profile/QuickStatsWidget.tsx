interface QuickStatsProps {
  totalReviews: number;
  totalLists: number;
  achievements: number;
  className?: string;
}

export function QuickStatsWidget({
  totalReviews,
  totalLists,
  achievements,
  className = '',
}: QuickStatsProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Total Reviews</span>
          <span className="font-medium">{totalReviews}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Lists Created</span>
          <span className="font-medium">{totalLists}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Achievements</span>
          <span className="font-medium">{achievements}</span>
        </div>
      </div>
    </div>
  );
}