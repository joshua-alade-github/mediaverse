export function ModHistory() {
  const { data: actions, isLoading, fetchNextPage, hasNextPage } = useModHistory();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {actions?.pages.map((page) =>
          page.map((action) => (
            <div
              key={action.id}
              className="flex items-start space-x-3 border-b border-gray-100 pb-4"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{action.moderator.username}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-500">
                    {timeAgo(action.createdAt)}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{action.description}</p>
              </div>
            </div>
          ))
        )}

        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}