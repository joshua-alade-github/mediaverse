'use client';

import { getServiceForType } from '@/lib/services/media';
import { Media, MediaType } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function RelatedMedia({ 
  mediaId, 
  mediaType 
}: { 
  mediaId: string; 
  mediaType: MediaType; 
}) {
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setIsLoading(true);
        const service = getServiceForType(mediaType);
        
        let relatedMedia: any[] = [];
        
        // Each API service has different methods for getting recommendations
        switch (mediaType) {
          case 'movie':
          case 'tv_show':
            // For TMDB, fetch similar movies/shows
            const tmdbResponse = await fetch(`/api/tmdb/recommendations?id=${mediaId}&type=${mediaType === 'movie' ? 'movie' : 'tv'}`);
            const tmdbData = await tmdbResponse.json();
            
            // Map TMDB specific fields to our standard format right away
            relatedMedia = (tmdbData.results?.slice(0, 5) || []).map(item => ({
              externalId: item.id.toString(),
              title: item.title || item.name,
              description: item.overview,
              coverImage: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
              releaseDate: item.release_date || item.first_air_date,
              averageRating: item.vote_average,
              externalSource: 'tmdb'
            }));
            break;
            
          case 'book':
            // For Google Books, we can search by similar genres/authors
            const bookDetails = await service.getMediaDetails(mediaId);
            const authors = bookDetails?.referenceData?.authors;
            const categories = bookDetails?.referenceData?.categories;
            
            // Search by author or category
            if (authors?.length) {
              const authorName = authors[0].name;
              const searchResults = await service.searchMedia(`inauthor:${authorName}`);
              relatedMedia = searchResults
                .filter(item => item.externalId !== mediaId)
                .slice(0, 5);
            } else if (categories?.length) {
              const categoryName = categories[0];
              const searchResults = await service.searchMedia(`subject:${categoryName}`);
              relatedMedia = searchResults
                .filter(item => item.externalId !== mediaId)
                .slice(0, 5);
            }
            break;
            
          case 'game':
            // For IGDB, fetch games with similar genres
            const gameDetails = await service.getMediaDetails(mediaId);
            const genres = gameDetails?.referenceData?.genres;
            
            if (genres?.length) {
              // Construct a query for games with similar genres
              const genreNames = genres.join(" | ");
              const searchResults = await service.searchMedia(genreNames);
              relatedMedia = searchResults
                .filter(item => item.externalId !== mediaId)
                .slice(0, 5);
            }
            break;
            
          case 'music':
            // For LastFM, get similar artists or albums
            const musicDetails = await service.getMediaDetails(mediaId);
            const type = musicDetails?.referenceData?.type || 'album';
            
            if (type === 'artist' && musicDetails?.referenceData?.similar) {
              // For artists, LastFM already provides similar artists
              const similarArtists = musicDetails.referenceData.similar;
              relatedMedia = await Promise.all(
                similarArtists.slice(0, 5).map(async (item: any) => {
                  try {
                    return await service.getMediaDetails(item.name, 'artist');
                  } catch (error) {
                    console.error('Error fetching artist details:', error);
                    return null;
                  }
                })
              );
              relatedMedia = relatedMedia.filter(Boolean);
            } else if (musicDetails?.title && musicDetails?.referenceData?.artist) {
              // For albums/tracks, search by the same artist
              const artistName = musicDetails.referenceData.artist;
              const searchResults = await service.searchMedia(`artist:${artistName}`);
              relatedMedia = searchResults
                .filter(item => item.externalId !== mediaId)
                .slice(0, 5);
            }
            break;
            
          default:
            // For other media types, fall back to popular media in the same category
            relatedMedia = await service.getPopularMedia();
            relatedMedia = relatedMedia.slice(0, 5);
        }
        
        // Format the data to match the Media type and ensure values are properly formatted
        const formattedMedia = relatedMedia.map(item => {
          console.log('Item data:', JSON.stringify(item));
          return {
            id: item.externalId || `${mediaType}-${Math.random().toString(36).substring(2, 9)}`,
            type: mediaType,
            title: item.title || 'Untitled',
            description: item.description,
            coverImage: item.coverImage || item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            releaseDate: item.releaseDate || item.release_date || item.first_air_date,
            rating: item.averageRating || item.vote_average,
            externalSource: item.externalSource || 'unknown',
            externalId: item.externalId || item.id
          };
        });
        
        setRecommendations(formattedMedia);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    }

    if (mediaId && mediaType) {
      fetchRecommendations();
    }
  }, [mediaId, mediaType]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!recommendations.length) {
    return <div className="p-4 text-center">No recommendations found</div>;
  }

  return (
    <div className="mt-4">
      <ul className="space-y-4">
        {recommendations.map((media) => (
          <li key={media.id} className="border rounded-lg p-4 shadow-sm hover:bg-gray-50 transition-colors">
            <Link href={`/${media.type}/${media.externalId}`} className="flex items-center gap-4">
              {media.coverImage ? (
                <div className="w-16 h-24 shrink-0 overflow-hidden rounded bg-gray-100">
                  <img 
                    src={media.coverImage} 
                    alt={media.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Prevent infinite loop of error events
                      e.currentTarget.onerror = null;
                      // Use a data URI instead of an external file to avoid 404s
                      e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2256%22%20height%3D%2284%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2056%2084%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%2256%22%20height%3D%2284%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2228%22%20y%3D%2242%22%20style%3D%22font-family%3A%20Arial%2C%20sans-serif%3Bfont-size%3A%2012px%3Bfill%3A%20%23999%3Btext-anchor%3A%20middle%3Bdominant-baseline%3A%20middle%3B%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-24 shrink-0 overflow-hidden rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center">
                  No Image
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-lg">{media.title}</h3>
                {media.releaseDate && (
                  <p className="text-sm text-gray-500">
                    {new Date(media.releaseDate).getFullYear()}
                  </p>
                )}
                {media.rating !== undefined && media.rating !== null && (
                  <div className="mt-1 flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm">{typeof media.rating === 'number' ? (Math.round(media.rating * 10) / 10).toFixed(1) : media.rating}</span>
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}