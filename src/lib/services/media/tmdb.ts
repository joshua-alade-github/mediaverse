import { BaseMediaService } from './base';
import { TMDBSearchOptions, TMDBDetailsOptions } from './types';
import { ExternalSourceType, MediaReference, NewsItem } from '@/types';
import { RateLimiter } from './rate-limiter';

interface TMDBConfig {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    poster_sizes: string[];
  };
}

export class TMDBService extends BaseMediaService {
    protected apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
    protected source: ExternalSourceType = 'tmdb';
    protected sourceUrl = 'https://www.themoviedb.org';
    protected rateLimiter = new RateLimiter(40, 10);
    private baseUrl = 'https://api.themoviedb.org/3';
    private config: TMDBConfig | null = null;
  
    constructor() {
      super();
      // Make initialization non-blocking
      this.initConfig().catch(error => {
        console.warn('TMDB config initialization failed:', error);
        // Service can still work without config
      });
    }
  
    private async initConfig() {
      try {
        const data = await this.fetchWithCache<{ images: TMDBConfig['images'] }>(
          `${this.baseUrl}/configuration`
        );
        this.config = {
          images: data.images
        };
      } catch (error) {
        // Don't let initialization error break the service
        console.warn('TMDB config initialization failed:', error);
        // Service can use default image URLs if needed
        this.config = {
          images: {
            base_url: 'https://image.tmdb.org/t/p/',
            secure_base_url: 'https://image.tmdb.org/t/p/',
            backdrop_sizes: ['w300', 'w780', 'w1280', 'original'],
            poster_sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original']
          }
        };
      }
    }
  
    protected async fetchWithCache<T>(url: string, options: RequestInit = {}): Promise<T> {
      // Add api_key as a URL parameter
      const urlWithKey = url.includes('?') 
        ? `${url}&api_key=${this.apiKey}`
        : `${url}?api_key=${this.apiKey}`;
    
      // Add language parameter if not present
      const urlWithParams = urlWithKey.includes('language=')
        ? urlWithKey
        : `${urlWithKey}&language=en-US`;
    
      // Use the base fetchWithCache with content-type header
      return super.fetchWithCache<T>(urlWithParams, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });
    }

  protected getImageUrl(path: string | null, size: 'poster' | 'backdrop' = 'poster'): string | undefined {
    if (!path) return undefined;
    
    // Use default configuration if config initialization failed
    const baseUrl = this.config?.images.secure_base_url || 'https://image.tmdb.org/t/p/';
    const preferredSize = size === 'poster' ? 'w500' : 'w780';
    
    return `${baseUrl}${preferredSize}${path}`;
  }

  public async searchMedia(query: string): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: TMDBSearchOptions): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: TMDBSearchOptions = {}): Promise<MediaReference[]> {
    const { type = 'movie', page = 1, includeAdult = false, language = 'en-US' } = options;
    
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/search/${type}?` + 
      `query=${encodeURIComponent(query)}&` +
      `page=${page}&` +
      `include_adult=${includeAdult}&` +
      `language=${language}`
    );

    return data.results.map((item: any) => this.transformTMDBResult(item, type));
  }

  public async getMediaDetails(id: string): Promise<MediaReference>;
  public async getMediaDetails(id: string, options: TMDBDetailsOptions): Promise<MediaReference>;
  public async getMediaDetails(id: string, options?: TMDBDetailsOptions): Promise<MediaReference> {
    const { type = 'movie', appendToResponse = ['credits', 'videos'], language = 'en-US' } = options || {};
    
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/${type}/${id}?` +
      `append_to_response=${appendToResponse.join(',')}&` +
      `language=${language}`
    );

    return this.transformTMDBResult(data, type);
  }

  public async getTrendingMedia(type: 'movie' | 'tv' = 'movie'): Promise<MediaReference[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/trending/${type}/week`
    );

    return data.results.map((item: any) => this.transformTMDBResult(item, type));
  }

  public async getPopularMedia(type: 'movie' | 'tv' = 'movie'): Promise<MediaReference[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/${type}/popular`
    );

    return data.results.map((item: any) => this.transformTMDBResult(item, type));
  }

  public async getUpcomingReleases(limit: number = 20): Promise<NewsItem[]> {
    const moviePromise = this.fetchWithCache<any>(
      `${this.baseUrl}/movie/upcoming?page=1&per_page=${limit/2}`
    );
    const tvPromise = this.fetchWithCache<any>(
      `${this.baseUrl}/tv/on_the_air?page=1&per_page=${limit/2}`
    );
  
    const [movieData, tvData] = await Promise.all([moviePromise, tvPromise]);
  
    const movies = movieData.results.map((item: any) => ({
      id: String(item.id),
      title: item.title,
      description: item.overview,
      imageUrl: this.getImageUrl(item.poster_path),
      url: `https://www.themoviedb.org/movie/${item.id}`,
      publishedAt: item.release_date,
      source: 'TMDB',
      type: 'upcoming_release'
    }));
  
    const tvShows = tvData.results.map((item: any) => ({
      id: String(item.id),
      title: item.name,
      description: item.overview,
      imageUrl: this.getImageUrl(item.poster_path),
      url: `https://www.themoviedb.org/tv/${item.id}`,
      publishedAt: item.first_air_date,
      source: 'TMDB',
      type: 'upcoming_release'
    }));
  
    return [...movies, ...tvShows]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  private transformTMDBResult(item: any, type: 'movie' | 'tv'): MediaReference {
    const tmdbUrl = `https://www.themoviedb.org/${type}/${item.id}`;
    const releaseDate = type === 'movie' ? item.release_date : item.first_air_date;
    
    return {
      internalId: undefined,
      externalId: item.id.toString(),
      externalSource: this.source,
      title: type === 'movie' ? item.title : item.name,
      description: item.overview,
      mediaType: type === 'movie' ? 'movie' : 'tv_show',
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      coverImage: this.getImageUrl(item.poster_path),
      averageRating: item.vote_average,
      totalReviews: item.vote_count,
      attribution: this.createAttribution(tmdbUrl),
      referenceData: {
        originalTitle: type === 'movie' ? item.original_title : item.original_name,
        originalLanguage: item.original_language,
        popularity: item.popularity,
        adult: item.adult,
        video: item.video,
        backdropPath: this.getImageUrl(item.backdrop_path, 'backdrop'),
        genres: item.genres?.map((g: any) => g.name) || [],
        credits: item.credits ? {
          cast: item.credits.cast?.slice(0, 10),
          crew: item.credits.crew?.filter((c: any) => 
            ['Director', 'Producer', 'Writer'].includes(c.job)
          )
        } : undefined,
        videos: item.videos?.results?.filter((v: any) => 
          v.site === 'YouTube' && ['Trailer', 'Teaser'].includes(v.type)
        )
      }
    };
  }

  toString() {
    return "TMDBService"; // Or a more detailed representation if needed
  }
}