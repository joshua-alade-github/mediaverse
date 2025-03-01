import { BaseMediaLayout } from './BaseMediaLayout';

export function MovieDetails({ media }) {
  return (
    <BaseMediaLayout media={media}>
      <div className="mt-8 space-y-6">
        {/* Movie-specific metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {media.referenceData.runtime && (
            <div>
              <dt className="font-medium text-gray-900">Runtime</dt>
              <dd className="text-gray-500">{media.referenceData.runtime} minutes</dd>
            </div>
          )}
          {media.referenceData.budget && (
            <div>
              <dt className="font-medium text-gray-900">Budget</dt>
              <dd className="text-gray-500">
                ${media.referenceData.budget.toLocaleString()}
              </dd>
            </div>
          )}
        </div>

        {/* Cast & Crew */}
        {media.referenceData.credits && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Cast & Crew</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Cast</h3>
                <div className="space-y-2">
                  {media.referenceData.credits.cast?.slice(0, 5).map((person) => (
                    <div key={person.id} className="text-sm">
                      <span className="font-medium">{person.name}</span>
                      <span className="text-gray-500"> as {person.character}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Crew</h3>
                <div className="space-y-2">
                  {media.referenceData.credits.crew?.slice(0, 5).map((person) => (
                    <div key={person.id} className="text-sm">
                      <span className="font-medium">{person.name}</span>
                      <span className="text-gray-500"> - {person.job}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseMediaLayout>
  );
}