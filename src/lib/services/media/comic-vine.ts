import { BaseMediaService } from './base';
import { ComicVineSearchOptions } from './types';
import { ExternalSourceType, MediaReference, NewsItem } from '@/types';
import { RateLimiter } from './rate-limiter';

export class ComicVineService extends BaseMediaService {
  protected apiKey = process.env.NEXT_PUBLIC_COMIC_VINE_API_KEY!;
  protected source: ExternalSourceType = 'comic_vine';
  protected sourceUrl = 'https://comicvine.gamespot.com';
  protected rateLimiter = new RateLimiter(200, 3600); // 200 requests per hour
  private baseUrl = 'https://comicvine.gamespot.com/api';

  protected async fetchWithCache<T>(url: string, options: RequestInit = {}): Promise<T> {
    // Comic Vine requires a specific format and API key in URL
    const separator = url.includes('?') ? '&' : '?';
    const finalUrl = `${url}${separator}api_key=${this.apiKey}&format=json`;

    return super.fetchWithCache<T>(finalUrl, {
      ...options,
      headers: {
        ...options.headers,
        'User-Agent': 'Mediaverse/1.0' // Comic Vine requires a User-Agent
      }
    });
  }

  public async searchMedia(query: string): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: ComicVineSearchOptions): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: ComicVineSearchOptions = {}): Promise<MediaReference[]> {
    const {
      resources = ['issue', 'volume'],
      limit = 20,
      offset = 0,
      sort = 'date_last_updated:desc'
    } = options;

    const params = new URLSearchParams({
      query: encodeURIComponent(query),
      resources: resources.join(','),
      limit: limit.toString(),
      offset: offset.toString(),
      sort
    });

    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/search?${params}`
    );

    return data.results.map(this.transformComicVineResult.bind(this));
  }

  public async getMediaDetails(id: string, type: 'issue' | 'volume' = 'issue'): Promise<MediaReference> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/${type}/${id}`
    );

    return this.transformComicVineResult(data.results);
  }

  public async getTrendingMedia(): Promise<MediaReference[]> {
    // Comic Vine doesn't have trending, so we'll use recent issues
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/issues?sort=date_last_updated:desc&limit=20`
    );

    return data.results.map(this.transformComicVineResult.bind(this));
  }

  public async getPopularMedia(): Promise<MediaReference[]> {
    // Use highest-rated issues as proxy for popularity
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/issues?sort=rating:desc&limit=20`
    );

    return data.results.map(this.transformComicVineResult.bind(this));
  }

  public async getLatestNews(limit: number = 20): Promise<NewsItem[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/articles?sort=date:desc&limit=${limit}`
    );
  
    return data.results.map((item: any) => ({
      id: String(item.id),
      title: item.title,
      description: this.sanitizeHtml(item.description),
      imageUrl: item.image.super_url?.replace('http:', 'https:'),
      url: item.site_detail_url,
      publishedAt: item.date_added,
      source: 'Comic Vine',
      type: 'news'
    }));
  }

  private transformComicVineResult(item: any): MediaReference {
    const isIssue = 'issue_number' in item;
    const type = isIssue ? 'issue' : 'volume';
    const comicVineUrl = `https://comicvine.gamespot.com/${type}/${item.id}`;

    return {
      internalId: undefined,
      externalId: item.id.toString(),
      externalSource: this.source,
      title: item.name || item.volume?.name,
      description: this.sanitizeHtml(item.description),
      mediaType: 'comic',
      releaseDate: item.cover_date ? new Date(item.cover_date) : undefined,
      coverImage: item.image?.super_url?.replace('http:', 'https:'),
      averageRating: item.rating !== null ? item.rating : undefined,
      totalReviews: item.rating_count,
      attribution: this.createAttribution(comicVineUrl),
      referenceData: {
        type,
        issueNumber: item.issue_number,
        volumeName: item.volume?.name,
        coverDate: item.cover_date,
        storeDate: item.store_date,
        characters: item.character_credits?.map((char: any) => ({
          id: char.id,
          name: char.name,
          role: 'character'
        })),
        creators: item.person_credits?.map((person: any) => ({
          id: person.id,
          name: person.name,
          role: person.role
        })),
        teams: item.team_credits?.map((team: any) => ({
          id: team.id,
          name: team.name,
          role: 'team'
        })),
        locations: item.location_credits?.map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          role: 'location'
        })),
        publishers: item.publishers?.map((pub: any) => ({
          id: pub.id,
          name: pub.name,
          role: 'publisher'
        })),
        siteDetailUrl: item.site_detail_url,
        apiDetailUrl: item.api_detail_url
      }
    };
  }

  private sanitizeHtml(html: string | null): string | undefined {
    if (!html) return undefined;
    // Basic HTML sanitization
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Additional utility methods
  public async getPublisher(publisherId: string): Promise<any> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/publisher/${publisherId}`
    );
    return data.results;
  }

  public async getCharacter(characterId: string): Promise<any> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/character/${characterId}`
    );
    return data.results;
  }

  public async getVolume(volumeId: string): Promise<any> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/volume/${volumeId}`
    );
    return data.results;
  }

  public async getIssuesInVolume(volumeId: string): Promise<any[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/issues?filter=volume:${volumeId}&sort=cover_date:asc`
    );
    return data.results;
  }

  public async getCreator(creatorId: string): Promise<any> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/person/${creatorId}`
    );
    return data.results;
  }
}