'use client';

import { useState, useEffect } from 'react';
import { getServiceForType } from '@/lib/services/media';
import { MediaType, MediaReference } from '@/types';
import { MovieDetails } from './MovieDetails';
import { GameDetails } from './GameDetails';
import { BookDetails } from './BookDetails';
import { MusicDetails } from './MusicDetails';
import { DefaultDetails } from './DefaultDetails';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';

interface MediaDetailsProps {
  id: string;
  mediaType: MediaType;
}

export function MediaDetails({ id, mediaType }: MediaDetailsProps) {
  const [media, setMedia] = useState<MediaReference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const service = getServiceForType(mediaType);
        const details = await service.getMediaDetails(id);
        setMedia(details);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, mediaType]);

  if (isLoading) return <LoadingSkeleton />;
  if (error || !media) return <ErrorState />;

  const renderMediaSpecificDetails = () => {
    switch (mediaType) {
      case 'movie':
        return <MovieDetails media={media} />;
      case 'game':
        return <GameDetails media={media} />;
      case 'book':
        return <BookDetails media={media} />;
      case 'music':
        return <MusicDetails media={media} />;
      default:
        return <DefaultDetails media={media} />;
    }
  };

  return renderMediaSpecificDetails();
}