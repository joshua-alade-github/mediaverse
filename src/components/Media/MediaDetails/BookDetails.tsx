import { BaseMediaLayout } from './BaseMediaLayout';

export function BookDetails({ media }) {
  return (
    <BaseMediaLayout media={media}>
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {media.referenceData.authors?.length > 0 && (
            <div>
              <dt className="font-medium text-gray-900">Authors</dt>
              <dd className="text-gray-500">
                {media.referenceData.authors.map(a => a.name).join(', ')}
              </dd>
            </div>
          )}
          {media.referenceData.publisher && (
            <div>
              <dt className="font-medium text-gray-900">Publisher</dt>
              <dd className="text-gray-500">{media.referenceData.publisher.name}</dd>
            </div>
          )}
          {media.referenceData.pageCount && (
            <div>
              <dt className="font-medium text-gray-900">Pages</dt>
              <dd className="text-gray-500">{media.referenceData.pageCount}</dd>
            </div>
          )}
          {media.referenceData.isbn && (
            <div>
              <dt className="font-medium text-gray-900">ISBN</dt>
              <dd className="text-gray-500">{media.referenceData.isbn}</dd>
            </div>
          )}
        </div>
      </div>
    </BaseMediaLayout>
  );
}