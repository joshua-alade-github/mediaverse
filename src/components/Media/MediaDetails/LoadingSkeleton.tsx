export function LoadingSkeleton() {
    return (
      <div className="bg-white shadow rounded-lg p-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="max-h-[500px] aspect-[2/3] bg-gray-200 rounded-lg" />
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }