'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Media } from '@/types';

interface MediaCardProps {
  media: Media;
}

export function MediaCard({ media }: MediaCardProps) {

  return (
    <div className="group relative bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <Link href={`/${media.mediaType}/${media.id}`}>
        <div className="aspect-w-2 aspect-h-3 rounded-t-lg overflow-hidden max-h-[300px]">
          {media.coverImage ? (
            <Image
              src={media.coverImage}
              alt={media.title}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <Link 
              href={`/${media.mediaType}/${media.id}`}
              className="text-lg font-medium text-gray-900 hover:text-indigo-600"
            >
              {media.title}
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              {media.releaseDate && new Date(media.releaseDate).getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}