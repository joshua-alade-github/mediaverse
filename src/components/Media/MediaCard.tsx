'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
//import { Star, Plus } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Media } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { QuickAddMenu } from './QuickAddMenu';

interface MediaCardProps {
  media: Media;
}

export function MediaCard({ media }: MediaCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

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
          
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
              >
                <Plus className="h-5 w-5" />
              </button>
              
              {isMenuOpen && (
                <QuickAddMenu
                  media={media}
                  onClose={() => setIsMenuOpen(false)}
                />
              )}
            </div>
          )}
        </div>

        {/* <div className="mt-2 flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-700">
            {media.averageRating?.toFixed(1) || 'N/A'}
          </span>
          <span className="text-sm text-gray-500">
            ({media.totalReviews || 0})
          </span>
        </div> */}
      </div>
    </div>
  );
}