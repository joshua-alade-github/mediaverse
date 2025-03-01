import { BaseMediaService } from './base';
import { RAWGSearchOptions } from './types';
import { ExternalSourceType, MediaReference, NewsItem } from '@/types';
import { RateLimiter } from './rate-limiter';

export class RAWGService extends BaseMediaService {
  protected apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY!;
  protected source: ExternalSourceType = 'rawg';
  protected sourceUrl = 'https://rawg.io';
  protected rateLimiter = new RateLimiter(5, 1); // 5 requests per second
  private baseUrl = 'https://api.rawg.io/api';

  public async searchMedia(query: string): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: RAWGSearchOptions): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: RAWGSearchOptions = {}): Promise<MediaReference[]> {
    const { 
      platforms = [], 
      genres = [], 
      ordering = 'relevance',
      page = 1,
      pageSize = 20 
    } = options;

    const params = new URLSearchParams();
    params.append('key', this.apiKey);
    params.append('search_precise', 'true');
    params.append('search_exact', 'false');
    params.append('search', query);
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    params.append('ordering', ordering);

    if (platforms.length) {
      params.append('platforms', platforms.join(','));
    }
    if (genres.length) {
      params.append('genres', genres.join(','));
    }

    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/games?${params}`
    );

    return data.results.map(this.transformRAWGResult.bind(this));
  }

  public async getMediaDetails(id: string): Promise<MediaReference> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/games/${id}?key=${this.apiKey}`
    );

    return this.transformRAWGResult(data);
  }

  public async getTrendingMedia(): Promise<MediaReference[]> {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/games?` +
      `key=${this.apiKey}&` +
      `dates=${lastMonth.toISOString().split('T')[0]},${new Date().toISOString().split('T')[0]}&` +
      `ordering=-added`
    );

    return data.results.map(this.transformRAWGResult.bind(this));
  }

  public async getPopularMedia(): Promise<MediaReference[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/games?key=${this.apiKey}&ordering=-rating&metacritic=80,100`
    );

    return data.results.map(this.transformRAWGResult.bind(this));
  }

  public async getLatestNews(limit: number = 20): Promise<NewsItem[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/games?ordering=-updated&dates=${
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },${new Date().toISOString().split('T')[0]}&page_size=${limit}`
    );
  
    return data.results.map((item: any) => ({
      id: String(item.id),
      title: item.name,
      description: item.description_raw || `${item.name} has been updated with new content.`,
      imageUrl: item.background_image,
      url: `https://rawg.io/games/${item.slug}`,
      publishedAt: item.updated,
      source: 'RAWG',
      type: 'game_update'
    }));
  }

  private transformRAWGResult(item: any): MediaReference {
    const rawgUrl = `https://rawg.io/games/${item.slug}`;

    return {
      internalId: undefined,
      externalId: item.id.toString(),
      externalSource: this.source,
      title: item.name,
      description: item.description_raw || item.description,
      mediaType: 'game',
      releaseDate: item.released ? new Date(item.released) : undefined,
      coverImage: item.image,
      averageRating: item.rating,
      totalReviews: item.ratings_count,
      attribution: this.createAttribution(rawgUrl),
      referenceData: {
        slug: item.slug,
        metacritic: item.metacritic,
        playtime: item.playtime,
        platforms: item.platforms?.map((p: any) => p.platform.name),
        genres: item.genres?.map((g: any) => g.name),
        tags: item.tags?.map((t: any) => t.name),
        esrbRating: item.esrb_rating?.name,
        developers: item.developers?.map((d: any) => ({
          name: d.name,
          role: 'developer'
        })),
        publishers: item.publishers?.map((p: any) => ({
          name: p.name,
          role: 'publisher'
        })),
        stores: item.stores?.map((s: any) => ({
          name: s.store.name,
          url: s.url
        }))
      }
    };
  }

  // Additional utility methods
  public async getPlatforms(): Promise<any[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/platforms?key=${this.apiKey}`
    );
    return data.results;
  }

  public async getGenres(): Promise<any[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/genres?key=${this.apiKey}`
    );
    return data.results;
  }
}