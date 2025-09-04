'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { getServiceForType } from '@/lib/services/media';
import type { NewsItem } from '@/types';

export function UpcomingReleases() {
  const [releases, setReleases] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const tmdbService = getServiceForType('movie');
        const gameService = getServiceForType('game');
        
        const [movieReleases, gameReleases] = await Promise.all([
          tmdbService.getUpcomingReleases(10),
          gameService.getLatestNews(10)
        ]);

        const combined = [...movieReleases, ...gameReleases]
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 6);

        setReleases(combined);
      } catch (error) {
        console.error('Error fetching releases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReleases();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {releases.map((release) => (
        <Link
          key={release.id}
          href={release.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
        >
          <div className="relative h-32">
            {release.imageUrl ? (
              <Image
                src={release.imageUrl}
                alt={release.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600">
              {release.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {formatDistanceToNow(new Date(release.publishedAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}