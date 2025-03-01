import { BaseMediaLayout } from './BaseMediaLayout';

export function DefaultDetails({ media }) {
  return (
    <BaseMediaLayout media={media}>
      <div className="mt-8 space-y-6">
        {media.referenceData && Object.entries(media.referenceData).length > 0 && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(media.referenceData).map(([key, value]) => {
              if (typeof value === 'string' || typeof value === 'number') {
                return (
                  <div key={key}>
                    <dt className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="text-gray-500">{value}</dd>
                  </div>
                );
              }
              if (Array.isArray(value)) {
                return (
                  <div key={key} className="col-span-2">
                    <dt className="font-medium text-gray-900 capitalize mb-2">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </dt>
                    <dd className="text-gray-500">
                      {value.map(item => 
                        typeof item === 'string' ? item : item.name || item.title
                      ).join(', ')}
                    </dd>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </BaseMediaLayout>
  );
}