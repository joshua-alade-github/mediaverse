import { BaseMediaService } from './base';
import { GoogleBooksSearchOptions } from './types';
import { ExternalSourceType, MediaReference, NewsItem } from '@/types';
import { RateLimiter } from './rate-limiter';

export class GoogleBooksService extends BaseMediaService {
  protected apiKey = ''; // Not required for basic access
  protected source: ExternalSourceType = 'google_books';
  protected sourceUrl = 'https://books.google.com';
  protected rateLimiter = new RateLimiter(1000, 60); // 1000 requests per minute
  private baseUrl = 'https://www.googleapis.com/books/v1';

  public async searchMedia(query: string): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: GoogleBooksSearchOptions): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: GoogleBooksSearchOptions = {}): Promise<MediaReference[]> {
    const {
      printType = 'all',
      orderBy = 'relevance',
      langRestrict,
      maxResults = 20
    } = options;

    const params = new URLSearchParams({
      q: query,
      printType,
      orderBy,
      maxResults: maxResults.toString()
    });

    if (langRestrict) {
      params.append('langRestrict', langRestrict);
    }

    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/volumes?${params}`
    );

    return data.items?.map(this.transformGoogleBooksResult.bind(this)) || [];
  }

  public async getMediaDetails(id: string): Promise<MediaReference> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/volumes/${id}`
    );

    return this.transformGoogleBooksResult(data);
  }

  public async getTrendingMedia(): Promise<MediaReference[]> {
    // Google Books doesn't have a trending endpoint, using new releases instead
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/volumes?q=subject:fiction&orderBy=newest&maxResults=20`
    );

    return data.items?.map(this.transformGoogleBooksResult.bind(this)) || [];
  }

  public async getPopularMedia(): Promise<MediaReference[]> {
    // Using bestseller fiction as proxy for popularity
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/volumes?q=subject:fiction&orderBy=relevance&maxResults=20`
    );

    return data.items?.map(this.transformGoogleBooksResult.bind(this)) || [];
  }

  public async getNewReleases(limit: number = 20): Promise<NewsItem[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/volumes?q=&orderBy=newest&maxResults=${limit}&printType=books`
    );
  
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      description: item.volumeInfo.description,
      imageUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
      url: item.volumeInfo.infoLink,
      publishedAt: item.volumeInfo.publishedDate,
      source: 'Google Books',
      type: 'new_release'
    }));
  }

  private transformGoogleBooksResult(item: any): MediaReference {
    const volumeInfo = item.volumeInfo;
    const googleBooksUrl = `https://books.google.com/books?id=${item.id}`;
    const saleInfo = item.saleInfo || {};

    return {
      internalId: undefined,
      externalId: item.id,
      externalSource: this.source,
      title: volumeInfo.title,
      description: volumeInfo.description,
      mediaType: 'book',
      releaseDate: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate) : undefined,
      coverImage: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
      averageRating: volumeInfo.averageRating,
      totalReviews: volumeInfo.ratingsCount,
      attribution: this.createAttribution(googleBooksUrl),
      referenceData: {
        subtitle: volumeInfo.subtitle,
        authors: volumeInfo.authors?.map((author: string) => ({
          name: author,
          role: 'author'
        })),
        publisher: {
          name: volumeInfo.publisher,
          role: 'publisher'
        },
        pageCount: volumeInfo.pageCount,
        categories: volumeInfo.categories,
        maturityRating: volumeInfo.maturityRating,
        language: volumeInfo.language,
        previewLink: volumeInfo.previewLink,
        infoLink: volumeInfo.infoLink,
        industryIdentifiers: volumeInfo.industryIdentifiers,
        saleInfo: {
          country: saleInfo.country,
          saleability: saleInfo.saleability,
          isEbook: saleInfo.isEbook,
          listPrice: saleInfo.listPrice,
          retailPrice: saleInfo.retailPrice,
          buyLink: saleInfo.buyLink
        }
      }
    };
  }

  // Additional utility methods
  public async searchByISBN(isbn: string): Promise<MediaReference | null> {
    const data = await this.searchMedia(`isbn:${isbn}`);
    return data.length > 0 ? data[0] : null;
  }

  toString() {
    return "GOOGLEBOOKSService";
  }
}