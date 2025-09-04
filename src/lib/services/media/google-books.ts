import { BaseMediaService } from './base';
import { ExternalSourceType, MediaReference, NewsItem } from '@/types';
import { RateLimiter } from './rate-limiter';

export class GoogleBooksService extends BaseMediaService {
  protected apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';
  protected source: ExternalSourceType = 'google_books';
  protected sourceUrl = 'https://books.google.com';
  protected rateLimiter = new RateLimiter(100, 10);
  private baseUrl = 'https://www.googleapis.com/books/v1';

  public async searchMedia(query: string): Promise<MediaReference[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        maxResults: '20',
        printType: 'books',
        orderBy: 'relevance'
      });

      if (this.apiKey) {
        params.append('key', this.apiKey);
      }

      const response = await fetch(`${this.baseUrl}/volumes?${params}`);
      const data = await response.json();

      if (!data.items) return [];

      return data.items.map(this.transformGoogleBooksResult.bind(this));
    } catch (error) {
      console.error('Google Books search error:', error);
      return [];
    }
  }

  public async getMediaDetails(id: string): Promise<MediaReference> {
    const params = this.apiKey ? `?key=${this.apiKey}` : '';
    const response = await fetch(`${this.baseUrl}/volumes/${id}${params}`);
    const data = await response.json();

    return this.transformGoogleBooksResult(data);
  }

  public async getTrendingMedia(): Promise<MediaReference[]> {
    // Google Books doesn't have trending, use bestsellers search
    try {
      const params = new URLSearchParams({
        q: 'subject:fiction',
        orderBy: 'newest',
        maxResults: '20',
        printType: 'books'
      });

      if (this.apiKey) {
        params.append('key', this.apiKey);
      }

      const response = await fetch(`${this.baseUrl}/volumes?${params}`);
      const data = await response.json();

      return data.items?.map(this.transformGoogleBooksResult.bind(this)) || [];
    } catch (error) {
      console.error('Google Books trending error:', error);
      return [];
    }
  }

  public async getPopularMedia(): Promise<MediaReference[]> {
    try {
      const params = new URLSearchParams({
        q: 'bestseller',
        orderBy: 'relevance',
        maxResults: '20',
        printType: 'books',
        langRestrict: 'en'
      });

      if (this.apiKey) {
        params.append('key', this.apiKey);
      }

      const response = await fetch(`${this.baseUrl}/volumes?${params}`);
      const data = await response.json();

      return data.items?.map(this.transformGoogleBooksResult.bind(this)) || [];
    } catch (error) {
      console.error('Google Books popular error:', error);
      return [];
    }
  }

  public async getNewReleases(limit: number = 20): Promise<NewsItem[]> {
    try {
      const params = new URLSearchParams({
        q: 'inpublisher',
        orderBy: 'newest',
        maxResults: limit.toString(),
        printType: 'books'
      });

      if (this.apiKey) {
        params.append('key', this.apiKey);
      }

      const response = await fetch(`${this.baseUrl}/volumes?${params}`);
      const data = await response.json();

      if (!data.items) return [];

      return data.items.map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        description: item.volumeInfo.description?.substring(0, 200) || '',
        imageUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
        url: item.volumeInfo.infoLink,
        publishedAt: item.volumeInfo.publishedDate || new Date().toISOString(),
        source: 'Google Books',
        type: 'new_release' as const
      }));
    } catch (error) {
      console.error('Google Books news error:', error);
      return [];
    }
  }

  private transformGoogleBooksResult(item: any): MediaReference {
    const volumeInfo = item.volumeInfo || {};
    
    return {
      externalId: item.id,
      externalSource: this.source,
      title: volumeInfo.title || 'Unknown Title',
      description: volumeInfo.description,
      mediaType: 'book',
      releaseDate: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate) : undefined,
      coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
      averageRating: volumeInfo.averageRating,
      totalReviews: volumeInfo.ratingsCount,
      attribution: this.createAttribution(`https://books.google.com/books?id=${item.id}`),
      referenceData: {
        subtitle: volumeInfo.subtitle,
        authors: volumeInfo.authors,
        publisher: volumeInfo.publisher,
        pageCount: volumeInfo.pageCount,
        categories: volumeInfo.categories,
        isbn: volumeInfo.industryIdentifiers?.[0]?.identifier
      }
    };
  }
}