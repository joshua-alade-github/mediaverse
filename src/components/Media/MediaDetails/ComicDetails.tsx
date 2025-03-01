import { BaseMediaLayout } from './BaseMediaLayout';

export function ComicDetails({ media }) {
  return (
    <BaseMediaLayout media={media}>
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {media.referenceData.series && (
            <div>
              <dt className="font-medium text-gray-900">Series</dt>
              <dd className="text-gray-500">{media.referenceData.series}</dd>
            </div>
          )}
          {media.referenceData.issueNumber && (
            <div>
              <dt className="font-medium text-gray-900">Issue Number</dt>
              <dd className="text-gray-500">#{media.referenceData.issueNumber}</dd>
            </div>
          )}
          {media.referenceData.creators?.length > 0 && (
            <div className="col-span-2">
              <dt className="font-medium text-gray-900 mb-2">Creators</dt>
              <div className="space-y-1">
                {media.referenceData.creators.map(creator => (
                  <div key={creator.id} className="text-gray-500">
                    {creator.name} - {creator.role}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseMediaLayout>
  );
}