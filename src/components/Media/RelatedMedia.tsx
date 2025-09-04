'use client';

import { useState, useEffect } from 'react';
import { getServiceForType } from '@/lib/services/media';
import { MediaCardWithAttribution } from './MediaCardWithAttribution';
import type { MediaType, MediaReference } from '@/types';

interface RelatedMediaProps {
  id: string;
  mediaType: MediaType;
}

export function RelatedMedia({ id, mediaType }: RelatedMediaProps) {
  const [related, setRelated] = useState<MediaReference[]>([]);
  const [popular, setPopular] = useState<MediaReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const service = getServiceForType(mediaType);
        
        // Get popular items as related content
        const popularItems = await service.getPopularMedia();
        setPopular(popularItems.filter(item => item.externalId !== id).slice(0, 4));
        
        // Also get trending for variety
        const trendingItems = await service.getTrendingMedia();
        setRelated(trendingItems.filter(item => item.externalId !== id).slice(0, 4));
      } catch (error) {
        console.error('Error fetching related media:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelated();
  }, [id, mediaType]);

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />;
  }

  return (
    <div className="space-y-8">
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">More Trending {mediaType === 'movie' ? 'Movies' : mediaType === 'game' ? 'Games' : mediaType === 'book' ? 'Books' : 'Music'}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((item) => (
              <MediaCardWithAttribution
                key={`${item.externalSource}-${item.externalId}`}
                media={item}
              />
            ))}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Popular {mediaType === 'movie' ? 'Movies' : mediaType === 'game' ? 'Games' : mediaType === 'book' ? 'Books' : 'Music'}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {popular.map((item) => (
              <MediaCardWithAttribution
                key={`${item.externalSource}-${item.externalId}`}
                media={item}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}