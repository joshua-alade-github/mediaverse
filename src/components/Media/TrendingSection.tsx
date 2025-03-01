import { Suspense } from 'react';
import { getTrendingAcrossServices } from '@/lib/services/media';
import { MediaCardWithAttribution } from '@/components/Media/MediaCardWithAttribution';
import type { MediaReference, MediaType } from '@/types';

async function getTrendingByType(type: MediaType): Promise<MediaReference[]> {
  const results = await getTrendingAcrossServices([type]);
  const mediaList = results[type] || [];
  
  // Deduplicate results
  const uniqueMedia = mediaList.filter(
    (item, index, self) =>
      index === self.findIndex(
        (t) => t.externalSource === item.externalSource && t.externalId === item.externalId
      )
  );

  return uniqueMedia
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 4);
}

async function TrendingContent({ type }: { type: MediaType }) {
  const media = await getTrendingByType(type);

  if (media.length === 0) {
    return <div className="text-center py-12 text-gray-500">No trending content found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {media.map((item) => (
        <MediaCardWithAttribution
          key={`${item.externalSource}-${item.externalId}`}
          media={item}
        />
      ))}
    </div>
  );
}

export function TrendingSection({ mediaType }: { mediaType: MediaType }) {
  return (
    <Suspense 
      fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="h-[360px] bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      }
    >
      <TrendingContent type={mediaType} />
    </Suspense>
  );
}