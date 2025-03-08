import { BaseMediaService } from './base';
import { ExternalSourceType, MediaReference, NewsItem } from '@/types';
import { RateLimiter } from './rate-limiter';

export class IGDBService extends BaseMediaService {
  protected apiKey = process.env.NEXT_PUBLIC_IGDB_CLIENT_ID!;
  protected source: ExternalSourceType = 'igdb';
  protected sourceUrl = 'https://igdb.com';
  protected rateLimiter = new RateLimiter(4, 1);
  private baseUrl = 'https://api.igdb.com/v4';
  private accessToken: string | null = null;

  private async getAccessToken() {
    if (this.accessToken) return this.accessToken;
    
    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${this.apiKey}&client_secret=${process.env.NEXT_PUBLIC_IGDB_CLIENT_SECRET}&grant_type=client_credentials`, {
      method: 'POST'
    });
    
    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  protected async fetchFromIGDB<T>(endpoint: string, query: string): Promise<T> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`; // Get base URL from environment
      const apiUrl = `${baseUrl}/api/igdb`; // Construct absolute URL

      console.log(`IGDB fetch: ${endpoint}, query: ${query}`);
      
      // Use direct fetch instead of fetchWithCache to avoid potential caching issues
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query, endpoint })
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`IGDB API error (${response.status}): ${text}`);
        return ([] as unknown) as T;
      }
      
      const data = await response.json();
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.warn(`Empty response from IGDB for endpoint ${endpoint}`);
        return (Array.isArray(data) ? [] : data) as T;
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching from IGDB (${endpoint}):`, error);
      return ([] as unknown) as T;
    }
  }

  public async searchMedia(query: string, options: any = {}): Promise<MediaReference[]> {
    const data = await this.fetchFromIGDB('games', `
      search "${query}";
      fields name,summary,cover.*,first_release_date,rating,rating_count,genres.name,platforms.name,involved_companies.*,slug;
      where cover != null;
      limit 20;
    `);

    return data.map(this.transformIGDBResult.bind(this));
  }

  public async getMediaDetails(id: string): Promise<MediaReference> {
    const [data] = await this.fetchFromIGDB('games', `
      fields name,summary,cover.*,first_release_date,rating,rating_count,genres.name,
        platforms.name,involved_companies.*,involved_companies.company.*,age_ratings.*,screenshots.*,videos.*,slug;
      where id = ${id};
    `);

    return this.transformIGDBResult(data);
  }

  public async getTrendingMedia(): Promise<MediaReference[]> {
    const currentTime = Math.floor(Date.now() / 1000);
    const monthAgo = currentTime - (30 * 24 * 60 * 60);

    const data = await this.fetchFromIGDB('games', `
      fields name,summary,cover.*,first_release_date,rating,rating_count,genres.name,platforms.name,involved_companies.*,involved_companies.company.*,slug;
      where cover != null & first_release_date >= ${monthAgo};
      sort first_release_date desc;
      limit 20;
    `);

    return data.map(this.transformIGDBResult.bind(this));
  }

  public async getPopularMedia(): Promise<MediaReference[]> {
    const data = await this.fetchFromIGDB('games', `
      fields name,summary,cover.*,first_release_date,rating,rating_count,genres.name,platforms.name,involved_companies.*,involved_companies.company.*,slug;
      where cover != null & rating >= 80;
      sort rating desc;
      limit 20;
    `);

    return data.map(this.transformIGDBResult.bind(this));
  }

  private transformIGDBResult(item: any): MediaReference {
    if (!item) {
      console.warn('Received undefined or null item from IGDB');
      return {
        internalId: undefined,
        externalId: 'unknown',
        externalSource: this.source,
        title: 'Unknown Game',
        description: 'No information available',
        mediaType: 'game',
        attribution: this.createAttribution(this.sourceUrl),
        referenceData: {}
      };
    }

    const igdbUrl = item.slug 
      ? `https://igdb.com/games/${item.slug}` 
      : `https://igdb.com/games/${item.id}`;

    // Safely handle cover image
    let coverImageUrl;
    try {
      const coverUrl = item.cover?.url;
      coverImageUrl = coverUrl ? `https:${coverUrl.replace('thumb', 'cover_big')}` : undefined;
    } catch (e) {
      console.warn(`Error processing cover image for game ${item.id}:`, e);
      coverImageUrl = undefined;
    }

    // Extract platforms safely
    let platforms = [];
    try {
      platforms = item.platforms?.map((p: any) => p.name) || [];
    } catch (e) {
      console.warn(`Error processing platforms for game ${item.id}:`, e);
    }

    // Extract genres safely
    let genres = [];
    try {
      genres = item.genres?.map((g: any) => g.name) || [];
    } catch (e) {
      console.warn(`Error processing genres for game ${item.id}:`, e);
    }

    // Extract developers safely
    let developers = [];
    try {
      developers = item.involved_companies
        ?.filter((c: any) => c.developer && c.company?.name)
        ?.map((c: any) => ({
            name: c.company.name,
            role: 'developer'
        })) || [];
    } catch (e) {
      console.warn(`Error processing developers for game ${item.id}:`, e);
    }

    // Extract publishers safely
    let publishers = [];
    try {
      publishers = item.involved_companies
        ?.filter((c: any) => c.publisher && c.company?.name)
        ?.map((c: any) => ({
            name: c.company.name,
            role: 'publisher'
        })) || [];
    } catch (e) {
      console.warn(`Error processing publishers for game ${item.id}:`, e);
    }

    return {
        internalId: undefined,
        externalId: item.id.toString(),
        externalSource: this.source,
        title: item.name,
        description: item.summary,
        mediaType: 'game',
        releaseDate: item.first_release_date ? new Date(item.first_release_date * 1000) : undefined,
        coverImage: coverImageUrl,
        averageRating: item.rating ? item.rating / 20 : undefined, // Convert to 5-star scale
        totalReviews: item.rating_count,
        attribution: this.createAttribution(igdbUrl),
        referenceData: {
            platforms,
            genres,
            developers,
            publishers,
            screenshots: item.screenshots?.map((s: any) => s.url) || [],
            videos: item.videos?.map((v: any) => v.video_id) || []
        }
    };
  }

  public async getGenres(): Promise<any[]> {
    return this.fetchFromIGDB('genres', 'fields name; limit 50;');
  }

  public async getPlatforms(): Promise<any[]> {
    return this.fetchFromIGDB('platforms', 'fields name; limit 50;');
  }

  toString() {
    return "IGDBService";
  }
}