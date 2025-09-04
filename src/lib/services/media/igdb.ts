import { BaseMediaService } from './base';
import { ExternalSourceType, MediaReference, NewsItem } from '@/types';
import { RateLimiter } from './rate-limiter';

export class IGDBService extends BaseMediaService {
  protected apiKey = process.env.NEXT_PUBLIC_IGDB_CLIENT_ID!;
  protected source: ExternalSourceType = 'igdb';
  protected sourceUrl = 'https://igdb.com';
  protected rateLimiter = new RateLimiter(4, 1);
  private baseUrl = '/api/igdb';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private async ensureToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    
    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${this.apiKey}&client_secret=${process.env.NEXT_PUBLIC_IGDB_CLIENT_SECRET}&grant_type=client_credentials`, {
      method: 'POST'
    });
    
    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early
    return this.accessToken;
  }

  protected async fetchFromIGDB<T>(endpoint: string, query: string): Promise<T> {
    try {
      await this.ensureToken();
      
      // Use the proxy endpoint
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          query
        })
      });
      
      if (!response.ok) {
        console.error(`IGDB API error: ${response.status}`);
        return [] as unknown as T;
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching from IGDB (${endpoint}):`, error);
      return [] as unknown as T;
    }
  }

  public async searchMedia(query: string): Promise<MediaReference[]> {
    const data = await this.fetchFromIGDB<any[]>('games', `
      search "${query}";
      fields name,summary,cover.*,first_release_date,total_rating,total_rating_count,
             genres.name,platforms.name,involved_companies.company.name,
             involved_companies.developer,involved_companies.publisher,slug;
      where cover != null;
      limit 20;
    `);

    return data.map(this.transformIGDBResult.bind(this));
  }

  public async getMediaDetails(id: string): Promise<MediaReference> {
    const data = await this.fetchFromIGDB<any[]>('games', `
      fields name,summary,cover.*,first_release_date,total_rating,total_rating_count,
             genres.name,platforms.name,involved_companies.company.name,
             involved_companies.developer,involved_companies.publisher,
             screenshots.*,videos.*,websites.*,slug,storyline;
      where id = ${id};
    `);

    if (!data || data.length === 0) {
      throw new Error('Game not found');
    }

    return this.transformIGDBResult(data[0]);
  }

  public async getTrendingMedia(): Promise<MediaReference[]> {
    // Get highly rated recent games (last 3 months)
    const threeMonthsAgo = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);
    
    const data = await this.fetchFromIGDB<any[]>('games', `
      fields name,summary,cover.*,first_release_date,total_rating,total_rating_count,
             genres.name,platforms.name,involved_companies.company.name,
             involved_companies.developer,involved_companies.publisher,slug;
      where cover != null & first_release_date > ${threeMonthsAgo} 
            & total_rating_count > 5;
      sort total_rating desc;
      limit 20;
    `);

    return data.map(this.transformIGDBResult.bind(this));
  }

  public async getPopularMedia(): Promise<MediaReference[]> {
    // Get highest rated games with significant ratings
    const data = await this.fetchFromIGDB<any[]>('games', `
      fields name,summary,cover.*,first_release_date,total_rating,total_rating_count,
             genres.name,platforms.name,involved_companies.company.name,
             involved_companies.developer,involved_companies.publisher,slug;
      where cover != null & total_rating != null & total_rating_count > 20;
      sort total_rating desc;
      limit 20;
    `);

    return data.map(this.transformIGDBResult.bind(this));
  }

  public async getLatestNews(limit: number = 20): Promise<NewsItem[]> {
    // Get upcoming games
    const now = Math.floor(Date.now() / 1000);
    const sixMonthsFromNow = now + (180 * 24 * 60 * 60);
    
    const data = await this.fetchFromIGDB<any[]>('games', `
      fields name,summary,cover.*,first_release_date,slug;
      where cover != null & first_release_date > ${now} 
            & first_release_date < ${sixMonthsFromNow};
      sort first_release_date asc;
      limit ${limit};
    `);

    return data.map((game: any) => ({
      id: String(game.id),
      title: game.name,
      description: game.summary || 'Upcoming release',
      imageUrl: game.cover ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : undefined,
      url: `https://igdb.com/games/${game.slug}`,
      publishedAt: new Date(game.first_release_date * 1000).toISOString(),
      source: 'IGDB',
      type: 'upcoming_release' as const
    }));
  }

  private transformIGDBResult(item: any): MediaReference {
    const igdbUrl = item.slug ? `https://igdb.com/games/${item.slug}` : `https://igdb.com/games/${item.id}`;
    const coverUrl = item.cover?.url;
    const coverImageUrl = coverUrl ? `https:${coverUrl.replace('t_thumb', 't_cover_big')}` : undefined;

    return {
      externalId: item.id.toString(),
      externalSource: this.source,
      title: item.name,
      description: item.summary || item.storyline,
      mediaType: 'game',
      releaseDate: item.first_release_date ? new Date(item.first_release_date * 1000) : undefined,
      coverImage: coverImageUrl,
      averageRating: item.total_rating ? item.total_rating / 20 : undefined,
      totalReviews: item.total_rating_count,
      attribution: this.createAttribution(igdbUrl),
      referenceData: {
        platforms: item.platforms?.map((p: any) => p.name) || [],
        genres: item.genres?.map((g: any) => g.name) || [],
        developers: item.involved_companies
          ?.filter((c: any) => c.developer)
          ?.map((c: any) => ({
            name: c.company.name,
            role: 'developer'
          })) || [],
        publishers: item.involved_companies
          ?.filter((c: any) => c.publisher)
          ?.map((c: any) => ({
            name: c.company.name,
            role: 'publisher'
          })) || [],
        screenshots: item.screenshots?.map((s: any) => `https:${s.url.replace('t_thumb', 't_screenshot_big')}`) || [],
        videos: item.videos?.map((v: any) => v.video_id) || [],
        websites: item.websites?.map((w: any) => ({ url: w.url, category: w.category })) || []
      }
    };
  }
}