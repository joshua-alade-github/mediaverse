import { BaseMediaLayout } from './BaseMediaLayout';

export function MusicDetails({ media }) {
  return (
    <BaseMediaLayout media={media}>
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {media.referenceData.artist && (
            <div>
              <dt className="font-medium text-gray-900">Artist</dt>
              <dd className="text-gray-500">{media.referenceData.artist}</dd>
            </div>
          )}
          {media.referenceData.album && (
            <div>
              <dt className="font-medium text-gray-900">Album</dt>
              <dd className="text-gray-500">{media.referenceData.album}</dd>
            </div>
          )}
          {media.referenceData.tracks?.length > 0 && (
            <div className="col-span-2">
              <dt className="font-medium text-gray-900 mb-2">Tracks</dt>
              <div className="space-y-2">
                {media.referenceData.tracks.map((track, index) => (
                  <div key={track.id} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded">
                    <span>{index + 1}. {track.name}</span>
                    <span className="text-gray-500">{track.duration}</span>
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