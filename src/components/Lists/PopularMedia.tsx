import { getPopularAcrossServices } from '@/lib/services/media';
import { MediaCardWithAttribution } from '@/components/Media/MediaCardWithAttribution';
import type { MediaReference } from '@/types';

async function getPopularMedia(): Promise<MediaReference[]> {
  try {
    const results = await getPopularAcrossServices([
      'movie',
      'game',
      'book',
      'music'
    ]);

    // Deduplicate results before sorting and slicing
    return Object.values(results)
      .flat()
      .filter((item, index, self) =>
        index === self.findIndex(
          (t) => t.externalSource === item.externalSource && t.externalId === item.externalId
        )
      )
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching popular media:', error);
    return [];
  }
}

export async function PopularMedia() {
  const popularMedia = await getPopularMedia();

  if (popularMedia.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No popular media found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {popularMedia.map((media) => (
        <MediaCardWithAttribution 
          key={`${media.externalSource}-${media.externalId}`}
          media={media}
        />
      ))}
    </div>
  );
}