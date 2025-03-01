'use client';

import { useRecommendations } from '@/hooks/useRecommendations';
import { MediaCard } from './MediaCard';
import { Media } from '@/types';

export function RelatedMedia({ 
  mediaId, 
  mediaType 
}: { 
  mediaId: string; 
  mediaType: string; 
}) {
  const { data: recommendations } = useRecommendations(mediaId, mediaType);

  return (
    <div className="grid grid-cols-1 gap-4">
      {recommendations?.map((media: Media) => (
        <MediaCard key={media.id} media={media} />
      ))}
    </div>
  );
}