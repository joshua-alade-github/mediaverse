import { getTrendingAcrossServices, getPopularAcrossServices, getServiceForType } from '@/lib/services/media';
import { MediaType, NewsItem } from '@/types';

class APIClient {
 async searchMedia(params: {
  query?: string;
  mediaTypes?: MediaType[];
  genres?: string[];
  minRating?: number;
  maxRating?: number;
  releaseYearStart?: number;
  releaseYearEnd?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  if (!params.query || !params.mediaTypes?.length) return [];

  const results = await Promise.all(
    params.mediaTypes.map(async type => {
      const service = getServiceForType(type);
      
      const serviceOptions: any = {};
      
      if (type === 'movie') {
        serviceOptions.type = 'movie';
      }
      
      if (type === 'game') {
        serviceOptions.genres = params.genres;
        serviceOptions.ordering = params.sortBy === 'rating' ? '-rating' : 
                               params.sortBy === 'date' ? '-released' : 
                               params.sortBy === 'title' ? 'name' : '-rating';
      }

      return service.searchMedia(params.query || '', serviceOptions);
    })
  );

  let allResults = results.flat();

  if (params.minRating || params.maxRating) {
    allResults = allResults.filter(item => {
      if (params.minRating && (!item.averageRating || item.averageRating < params.minRating)) return false;
      if (params.maxRating && (!item.averageRating || item.averageRating > params.maxRating)) return false;
      return true;
    });
  }

  if (params.releaseYearStart || params.releaseYearEnd) {
    allResults = allResults.filter(item => {
      if (!item.releaseDate) return false;
      const year = new Date(item.releaseDate).getFullYear();
      if (params.releaseYearStart && year < params.releaseYearStart) return false;
      if (params.releaseYearEnd && year > params.releaseYearEnd) return false;
      return true;
    });
  }

  if (params.sortBy) {
    allResults.sort((a, b) => {
      const order = params.sortOrder === 'asc' ? 1 : -1;
      switch (params.sortBy) {
        case 'rating':
          return ((a.averageRating || 0) - (b.averageRating || 0)) * order;
        case 'date':
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return (dateA - dateB) * order;
        case 'title':
          return a.title.localeCompare(b.title) * order;
        default:
          return 0;
      }
    });
  }

  return allResults;
}

  // External Media Methods
  async getMediaDetails(mediaType: MediaType, id: string) {
    const service = getServiceForType(mediaType);
    const details = await service.getMediaDetails(id);
 
    return details;
  }

 // Trending & Popular
 async getTrendingMedia(mediaType?: MediaType) {
  try {
    if (mediaType) {
      const service = getServiceForType(mediaType);
      
      return await service.getTrendingMedia();
    }
      
    const trending = await getTrendingAcrossServices();
    return Object.values(trending).flat();
  } catch (error) {
    console.error('Error getting trending media:', error);
    return [];
  }
 }

 async getPopularMedia(mediaType?: MediaType, limit: number = 5) {
  try {
    if (mediaType) {
      const service = getServiceForType(mediaType);
      
      const results = await service.getPopularMedia();
      return results.slice(0, limit);
    }
    
    const popular = await getPopularAcrossServices();
    return Object.values(popular).flat().slice(0, limit);
  } catch (error) {
    console.error('Error getting popular media:', error);
    return [];
  }
 }
 
 async getLatestNews(mediaType: MediaType, { limit = 6 } = {}): Promise<NewsItem[]> {
   const service = getServiceForType(mediaType);
   
   try {
     switch (mediaType) {
       case 'movie':
       case 'game':
         return service.getLatestNews(limit);
       case 'book':
       case 'music':
         return service.getNewReleases(limit);
       default:
         return [];
     }
   } catch (error) {
     console.error(`Error fetching news for ${mediaType}:`, error);
     return [];
   }
 }
}

export const apiClient = new APIClient();