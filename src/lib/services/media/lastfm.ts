import { BaseMediaService } from './base';
import { ExternalSourceType, MediaReference, NewsItem } from '@/types';
import { RateLimiter } from './rate-limiter';

export interface LastFMSearchOptions {
  limit?: number;
  page?: number;
  type?: 'album' | 'artist' | 'track';
}

export class LastFMService extends BaseMediaService {
  protected apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY!;
  protected source: ExternalSourceType = 'lastfm';
  protected sourceUrl = 'https://www.last.fm';
  protected rateLimiter = new RateLimiter(5, 1); // 5 requests per second
  private baseUrl = 'https://ws.audioscrobbler.com/2.0';

  private async fetchFromLastFM<T>(method: string, params: Record<string, string> = {}): Promise<T> {
    const searchParams = new URLSearchParams({
      method,
      api_key: this.apiKey,
      format: 'json',
      ...params
    });

    return this.fetchWithCache<T>(
      `${this.baseUrl}/?${searchParams.toString()}`
    );
  }

  public async searchMedia(query: string): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: LastFMSearchOptions): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: LastFMSearchOptions = {}): Promise<MediaReference[]> {
    const { 
      limit = 20, 
      page = 1,
      type = 'album'
    } = options;

    const searchMethod = `${type}.search`;
    const searchParams: Record<string, string> = {
      limit: limit.toString(),
      page: page.toString()
    };

    // Set the search parameter based on type
    searchParams[type] = query;

    const data = await this.fetchFromLastFM<any>(searchMethod, searchParams);

    // Handle the nested structure of Last.fm's response
    const resultsKey = `${type}matches`;
    const results = data?.results?.[resultsKey]?.[type] || [];
    
    return results.map((item: any) => this.transformLastFMResult(item, type));
  }

  public async getMediaDetails(id: string, type: 'album' | 'artist' | 'track' = 'album'): Promise<MediaReference> {
    const method = `${type}.getInfo`;
    const params: Record<string, string> = {
      mbid: id
    };

    // URL decode the ID before splitting
    const decodedId = decodeURIComponent(id);

    if (!decodedId.match(/^[0-9a-f-]{36}$/)) {
      const [name, artist] = decodedId.split('|||');

      if (type === 'album' || type === 'track') {
        params.artist = artist; // No need to check for undefined here, Last.fm API will handle it
        params[type] = name;
        delete params.mbid;
      } else {
        params.artist = name;
        delete params.mbid;
      }
    }

    const data = await this.fetchFromLastFM<any>(method, params);
    return this.transformLastFMResult(data[type], type);
  }

  public async getTrendingMedia(): Promise<MediaReference[]> {
    const data = await this.fetchFromLastFM<any>('chart.getTopArtists', {
      limit: '20'
    });

    return (data.artists?.artist || []).map((item: any) => 
      this.transformLastFMResult(item, 'artist')
    );
  }

  public async getPopularMedia(): Promise<MediaReference[]> {
    const data = await this.fetchFromLastFM<any>('chart.getTopTracks', {
      limit: '20'
    });

    return (data.tracks?.track || []).map((item: any) => 
      this.transformLastFMResult(item, 'track')
    );
  }

  private transformLastFMResult(item: any, type: 'album' | 'artist' | 'track'): MediaReference {
    if (!item) {
      throw new Error('Invalid Last.fm result item');
    }

    // Create a unique external ID using MBID if available, otherwise name+artist
    const externalId = item.mbid || 
      (type === 'artist' ? 
        item.name : 
        `${item.name}|||${item.artist}`);

    const lastfmUrl = item.url || `https://www.last.fm/music/${encodeURIComponent(item.name)}`;

    return {
      internalId: undefined,
      externalId,
      externalSource: this.source,
      title: item.name,
      description: item.wiki?.summary || `${type === 'artist' ? 'Artist' : type === 'album' ? 'Album' : 'Track'} on Last.fm`,
      mediaType: 'music',
      releaseDate: undefined, // Last.fm doesn't provide consistent release dates
      coverImage: this.getBestImage(item.image),
      averageRating: undefined, // Last.fm doesn't provide ratings
      totalReviews: undefined,
      attribution: this.createAttribution(lastfmUrl),
      referenceData: {
        type,
        playcount: parseInt(item.playcount || '0'),
        listeners: parseInt(item.listeners || '0'),
        artist: type !== 'artist' ? item.artist : undefined,
        tags: item.tags?.tag?.map((t: any) => t.name) || [],
        similar: item.similar?.artist?.map((a: any) => ({
          name: a.name,
          url: a.url
        })) || [],
        bio: item.bio?.content,
        images: item.image
      }
    };
  }

  private getBestImage(images?: any[]): string | undefined {
    if (!images || !Array.isArray(images)) return undefined;
    
    // Last.fm image sizes: small, medium, large, extralarge, mega
    const preferredSizes = ['mega', 'extralarge', 'large', 'medium', 'small'];
    
    for (const size of preferredSizes) {
      const image = images.find(img => img.size === size);
      if (image && image['#text']) {
        return image['#text'];
      }
    }
    
    return undefined;
  }

  // Additional utility methods
  public async getArtistTopTracks(artistName: string): Promise<any> {
    return this.fetchFromLastFM<any>('artist.getTopTracks', {
      artist: artistName,
      limit: '10'
    });
  }

  public async getSimilarArtists(artistName: string): Promise<any> {
    return this.fetchFromLastFM<any>('artist.getSimilar', {
      artist: artistName,
      limit: '10'
    });
  }

  public async getTopTags(): Promise<any> {
    return this.fetchFromLastFM<any>('tag.getTopTags');
  }

  toString() {
    return "LastFMService";
  }
}