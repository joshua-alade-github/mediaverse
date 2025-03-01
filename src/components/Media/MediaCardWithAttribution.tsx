'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Plus, Info } from 'lucide-react';
import type { Media, MediaReference } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { QuickAddMenu } from './QuickAddMenu';

interface MediaCardProps {
  media: (Media & {
    externalReference?: {
      attribution: {
        source: string;
        sourceUrl: string;
        license?: string;
      };
    };
  }) | MediaReference;
}

// Type guard to check if media is a MediaReference
function isMediaReference(media: MediaCardProps['media']): media is MediaReference {
  return 'attribution' in media;
}

export function MediaCardWithAttribution({ media }: MediaCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAttribution, setShowAttribution] = useState(false);
  const { user } = useAuth();

  // Get attribution based on media type
  const attribution = isMediaReference(media) 
    ? media.attribution 
    : media.externalReference?.attribution;

  return (
    <div className="group relative bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <Link href={`/${media.mediaType}/${isMediaReference(media) ? media.externalId : media.id}`}>
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
              href={`/${media.mediaType}/${isMediaReference(media) ? media.externalId : media.id}`}
              className="text-lg font-medium text-gray-900 hover:text-indigo-600"
            >
              {media.title}
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              {media.releaseDate && new Date(media.releaseDate).getFullYear()}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
            
            {attribution && (
              <button
                onClick={() => setShowAttribution(true)}
                className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
              >
                <Info className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-700">
            {media.averageRating?.toFixed(1) || 'N/A'}
          </span>
          <span className="text-sm text-gray-500">
            ({media.totalReviews || 0})
          </span>
        </div>
      </div>

      {isMenuOpen && (
        <QuickAddMenu
          media={media}
          onClose={() => setIsMenuOpen(false)}
        />
      )}

      {showAttribution && attribution && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-75 rounded-b-lg">
          <div className="text-white text-sm">
            <p>Data provided by{' '}
              <a 
                href={attribution.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200"
              >
                {attribution.source}
              </a>
            </p>
            {attribution.license && (
              <p className="text-xs mt-1 text-gray-300">
                {attribution.license}
              </p>
            )}
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