import { TMDBService } from './tmdb';
import { IGDBService } from './igdb';
import { RAWGService } from './rawg';
import { GoogleBooksService } from './google-books';
import { LastFMService } from './lastfm';
import { ComicVineService } from './comic-vine';
import type { MediaReference, MediaType } from '@/types';

// Initialize all services
export const mediaServices = {
  tmdb: new TMDBService(),
  igdb: new IGDBService(),
  rawg: new RAWGService(),
  googleBooks: new GoogleBooksService(),
  lastfm: new LastFMService(),
  comicVine: new ComicVineService(),
} as const;

// Map media types to services
export const serviceMap: Record<MediaType, keyof typeof mediaServices> = {
  movie: 'tmdb',
  tv_show: 'tmdb',
  game: 'igdb',
  //game: 'rawg',
  book: 'googleBooks',
  music: 'lastfm',
  comic: 'comicVine',
  manga: 'comicVine',
  anime: 'tmdb'
};

// Helper to get the appropriate service for a media type
export function getServiceForType(mediaType: MediaType) {
  const serviceName = serviceMap[mediaType];
  return mediaServices[serviceName];
}

// Search across all services
export async function searchAllServices(
  query: string,
  mediaTypes?: MediaType[]
): Promise<Record<MediaType, MediaReference[]>> {
  const results: Partial<Record<MediaType, MediaReference[]>> = {};
  const types = mediaTypes || Object.keys(serviceMap) as MediaType[];

  await Promise.all(
    types.map(async (type) => {
      try {
        const service = getServiceForType(type);
        results[type] = await service.searchMedia(query);
      } catch (error) {
        console.error(`Error searching ${type}:`, error);
        results[type] = [];
      }
    })
  );

  return results as Record<MediaType, MediaReference[]>;
}

// Get trending items across all services
export async function getTrendingAcrossServices(
  mediaTypes?: MediaType[]
): Promise<Record<MediaType, MediaReference[]>> {
  const results: Partial<Record<MediaType, MediaReference[]>> = {};
  const types = mediaTypes || Object.keys(serviceMap) as MediaType[];

  await Promise.all(
    types.map(async (type) => {
      try {
        const service = getServiceForType(type);
        results[type] = await service.getTrendingMedia();
      } catch (error) {
        console.error(`Error getting trending ${type}:`, error);
        results[type] = [];
      }
    })
  );

  return results as Record<MediaType, MediaReference[]>;
}

// Get popular items across all services
export async function getPopularAcrossServices(
  mediaTypes?: MediaType[]
): Promise<Record<MediaType, MediaReference[]>> {
  const results: Partial<Record<MediaType, MediaReference[]>> = {};
  const types = mediaTypes || Object.keys(serviceMap) as MediaType[];

  await Promise.all(
    types.map(async (type) => {
      try {
        const service = getServiceForType(type);
        results[type] = await service.getPopularMedia();
      } catch (error) {
        console.error(`Error getting popular ${type}:`, error);
        results[type] = [];
      }
    })
  );

  return results as Record<MediaType, MediaReference[]>;
}

// Get details for a specific item
export async function getMediaDetails(
  mediaType: MediaType,
  externalId: string
): Promise<MediaReference> {
  const service = getServiceForType(mediaType);
  return service.getMediaDetails(externalId);
}

// Export individual services for direct access if needed
export {
  TMDBService,
  IGDBService,
  GoogleBooksService,
  LastFMService,
  ComicVineService
};