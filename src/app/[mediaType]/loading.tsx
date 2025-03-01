export default function Loading() {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
  
        {/* Trending Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="h-[360px] bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
  
        {/* Reviews & Lists Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reviews Skeleton */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mb-4">
                <div className="h-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
  
          {/* Lists & Reviewers Skeleton */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-4">
                  <div className="h-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
  
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-4">
                  <div className="h-12 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Communities Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="h-[200px] bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
  
        {/* News Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="h-[240px] bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }