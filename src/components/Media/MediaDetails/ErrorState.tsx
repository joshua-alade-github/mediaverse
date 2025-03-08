interface ErrorStateProps {
  onRetry?: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="bg-white shadow rounded-lg p-8">
      <div className="text-center text-gray-500">
        <p className="mb-4">Failed to load media details</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}