'use client';

import { useState, useEffect } from 'react';
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
  const [media, setMedia] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadMediaDetails() {
      if (!id || !mediaType) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Loading media details for ${mediaType}/${id}`);
        const mediaData = await apiClient.getMediaDetails(mediaType, id);
        
        if (isMounted) {
          console.log(`Media details loaded:`, mediaData);
          setMedia(mediaData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(`Error loading media details for ${mediaType}/${id}:`, err);
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    }
    
    loadMediaDetails();
    
    return () => {
      isMounted = false;
    };
  }, [id, mediaType]);

  if (isLoading) return <LoadingSkeleton />;
  if (error || !media) {
    return (
      <ErrorState 
        onRetry={() => {
          setIsLoading(true);
          setError(null);
          apiClient.getMediaDetails(mediaType, id)
            .then(data => {
              setMedia(data);
              setIsLoading(false);
            })
            .catch(err => {
              setError(err as Error);
              setIsLoading(false);
            });
        }}
      />
    );
  }

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