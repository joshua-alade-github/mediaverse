import { Suspense } from 'react';
import { getTrendingAcrossServices } from '@/lib/services/media';
import { MediaCardWithAttribution } from '@/components/Media/MediaCardWithAttribution';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { MediaReference, MediaType } from '@/types';

interface TrendingMediaProps {
  mediaType?: MediaType;
}

const mediaTypes = [
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv_show' },
  { label: 'Games', value: 'game' },
  { label: 'Books', value: 'book' },
  { label: 'Music', value: 'music' },
  { label: 'Comics', value: 'comic' },
  { label: 'Manga', value: 'manga' },
  { label: 'Anime', value: 'anime' }
] as const;

async function getTrendingByType(type: MediaType): Promise<MediaReference[]> {
  try {
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
  } catch (error) {
    console.error(`Error getting trending content for ${type}:`, error);
    return [];
  }
}

async function MediaTypeContent({ type }: { type: MediaType }) {
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

export function TrendingMedia({ mediaType }: TrendingMediaProps) {
  // If we're on a specific media type page (e.g. /movies), only show that content
  if (mediaType) {
    return (
      <div className="w-full">
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
          <MediaTypeContent type={mediaType} />
        </Suspense>
      </div>
    );
  }

  // Otherwise, show tabs for all media types
  return (
    <Tabs defaultValue="movie" className="w-full">
      <TabsList className="flex space-x-1 mb-6 overflow-x-auto pb-2">
        {mediaTypes.map(({ label, value }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {mediaTypes.map(({ value }) => (
        <TabsContent key={value} value={value} className="mt-2">
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
            <MediaTypeContent type={value} />
          </Suspense>
        </TabsContent>
      ))}
    </Tabs>
  );
}