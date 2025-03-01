import { BaseMediaLayout } from './BaseMediaLayout';

export function TVShowDetails({ media }) {
  return (
    <BaseMediaLayout media={media}>
      <div className="mt-8 space-y-6">
        {/* Seasons */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Seasons</h2>
          <div className="space-y-4">
            {media.referenceData.seasons?.map((season) => (
              <div key={season.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    Season {season.number} ({season.episodeCount} episodes)
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(season.airDate).getFullYear()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{season.overview}</p>
              </div>
            ))}
          </div>
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