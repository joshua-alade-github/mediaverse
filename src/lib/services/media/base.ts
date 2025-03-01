import { MediaReference, NewsItem } from '@/types';
import { apiCache } from './cache';
import { RateLimiter } from './rate-limiter';

export abstract class BaseMediaService {
  protected abstract apiKey: string;
  protected abstract source: string;
  protected abstract sourceUrl: string;
  protected abstract rateLimiter: RateLimiter;

  protected async fetchWithCache<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cacheKey = `${this.source}_${url}`;
    
    // Try cache first
    const cached = await apiCache.get<T>(cacheKey, this.source);
    if (cached) {
      return cached;
    }

    // Wait for rate limit token
    await this.rateLimiter.waitForToken();

    // Fetch fresh data
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("url: " + url)
    
    // Cache the response
    apiCache.set(cacheKey, data, this.source);

    return data;
  }

  protected createAttribution(specificUrl: string) {
    return {
      source: this.source,
      sourceUrl: specificUrl || this.sourceUrl,
      timestamp: new Date().toISOString()
    };
  }

  // Make these methods required for all services
  public abstract searchMedia(query: string): Promise<MediaReference[]>;
  public abstract getMediaDetails(id: string): Promise<MediaReference>;
  public abstract getTrendingMedia(): Promise<MediaReference[]>;
  public abstract getPopularMedia(): Promise<MediaReference[]>;
  
  // News methods with default implementations that return empty arrays
  public getUpcomingReleases(limit: number = 20): Promise<NewsItem[]> {
    return Promise.resolve([]);
  }

  public getLatestNews(limit: number = 20): Promise<NewsItem[]> {
    return Promise.resolve([]);
  }

  public getNewReleases(limit: number = 20): Promise<NewsItem[]> {
    return Promise.resolve([]);
  }
}