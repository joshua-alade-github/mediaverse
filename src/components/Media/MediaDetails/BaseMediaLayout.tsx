import Image from 'next/image';
import { format } from 'date-fns';
import { Star } from 'lucide-react';

export function BaseMediaLayout({ media, children }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Hero Section */}
      {media.referenceData?.backdropPath && (
        <div className="relative h-64">
          <Image
            src={media.referenceData.backdropPath}
            alt={media.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cover Image */}
          <div className="max-h-[400px] w-full aspect-[2/3] relative rounded-lg overflow-hidden shadow-lg">
            {media.coverImage ? (
                <Image
                src={media.coverImage}
                alt={media.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
                />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900">{media.title}</h1>
            
            {/* Ratings */}
            {media.averageRating && (
              <div className="mt-2 flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-lg font-medium text-gray-900">
                  {media.averageRating.toFixed(1)}
                </span>
                {media.totalReviews && (
                  <span className="text-sm text-gray-500">
                    ({media.totalReviews.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Release Date */}
            {media.releaseDate && (
              <p className="mt-2 text-sm text-gray-500">
                Released: {format(new Date(media.releaseDate), 'MMMM d, yyyy')}
              </p>
            )}

            {/* Genres */}
            {media.referenceData?.genres && media.referenceData.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {media.referenceData.genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="mt-4 text-gray-700 whitespace-pre-line">
              {media.description}
            </p>

            {/* Media Specific Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}