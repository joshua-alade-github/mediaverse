'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Info } from 'lucide-react';
import type { MediaReference } from '@/types';

interface MediaCardProps {
  media: MediaReference;
}

export function MediaCardWithAttribution({ media }: MediaCardProps) {
  const [showAttribution, setShowAttribution] = useState(false);

  return (
    <div className="group relative bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <Link href={`/${media.mediaType}/${media.externalId}`}>
        <div className="relative w-full pt-[150%] rounded-t-lg overflow-hidden">
          {media.coverImage ? (
            <Image
              src={media.coverImage}
              alt={media.title}
              fill
              className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/${media.mediaType}/${media.externalId}`}
              className="text-lg font-medium text-gray-900 hover:text-indigo-600 line-clamp-1"
            >
              {media.title}
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              {media.releaseDate && new Date(media.releaseDate).getFullYear()}
            </p>
          </div>
          
          {media.attribution && (
            <button
              onClick={() => setShowAttribution(true)}
              className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
            >
              <Info className="h-4 w-4" />
            </button>
          )}
        </div>

        {media.averageRating && (
          <div className="mt-2 flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-700">
              {media.averageRating.toFixed(1)}
            </span>
            {media.totalReviews && (
              <span className="text-sm text-gray-500">
                ({media.totalReviews})
              </span>
            )}
          </div>
        )}
      </div>

      {showAttribution && media.attribution && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-75 rounded-b-lg">
          <div className="text-white text-sm">
            <p>Data from{' '}
              <a 
                href={media.attribution.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200"
              >
                {media.attribution.source}
              </a>
            </p>
          </div>
          <button
            onClick={() => setShowAttribution(false)}
            className="absolute top-2 right-2 text-white hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}