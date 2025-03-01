'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { MediaType } from '@/types';
import { TVShowDetails } from './TVShowDetails';
import { MovieDetails } from './MovieDetails';
import { GameDetails } from './GameDetails';
import { BookDetails } from './BookDetails';
import { MusicDetails } from './MusicDetails';
import { ComicDetails } from './ComicDetails';
import { DefaultDetails } from './DefaultDetails';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';

interface MediaDetailsProps {
  id: string;
  mediaType: MediaType;
}

export function MediaDetails({ id, mediaType }: MediaDetailsProps) {
  const { data: media, isLoading, error } = useQuery({
    queryKey: ['media-details', mediaType, id],
    queryFn: () => apiClient.getMediaDetails(mediaType, id)
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error || !media) return <ErrorState />;

  const renderMediaSpecificDetails = () => {
    switch (mediaType) {
      case 'movie':
        return <MovieDetails media={media} />;
      case 'tv_show':
        return <TVShowDetails media={media} />;
      case 'game':
        return <GameDetails media={media} />;
      case 'book':
        return <BookDetails media={media} />;
      case 'music':
        return <MusicDetails media={media} />;
      case 'comic':
      case 'manga':
        return <ComicDetails media={media} />;
      default:
        return <DefaultDetails media={media} />;
    }
  };

  return renderMediaSpecificDetails();
}