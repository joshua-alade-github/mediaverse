import { BaseMediaLayout } from './BaseMediaLayout';

export function GameDetails({ media }) {
  return (
    <BaseMediaLayout media={media}>
      <div className="mt-8 space-y-6">
        {/* Game-specific metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {media.referenceData.developers?.length > 0 && (
            <div>
              <dt className="font-medium text-gray-900">Developers</dt>
              <dd className="text-gray-500">
                {media.referenceData.developers.map(d => d.name).join(', ')}
              </dd>
            </div>
          )}
          {media.referenceData.publishers?.length > 0 && (
            <div>
              <dt className="font-medium text-gray-900">Publishers</dt>
              <dd className="text-gray-500">
                {media.referenceData.publishers.map(p => p.name).join(', ')}
              </dd>
            </div>
          )}
          {media.referenceData.platforms?.length > 0 && (
            <div>
              <dt className="font-medium text-gray-900">Platforms</dt>
              <dd className="text-gray-500">
                {media.referenceData.platforms.join(', ')}
              </dd>
            </div>
          )}
          {media.referenceData.esrbRating && (
            <div>
              <dt className="font-medium text-gray-900">ESRB Rating</dt>
              <dd className="text-gray-500">
                {media.referenceData.esrbRating}
              </dd>
            </div>
          )}
        </div>
      </div>
    </BaseMediaLayout>
  );
}