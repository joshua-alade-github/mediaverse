import { BaseMediaService } from './base';
import { SpotifySearchOptions } from './types';
import { ExternalSourceType, MediaReference, NewsItem } from '@/types';
import { RateLimiter } from './rate-limiter';

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expiry_time: number;
}

export class SpotifyService extends BaseMediaService {
  protected apiKey = ''; // Using OAuth instead
  protected source: ExternalSourceType = 'spotify';
  protected sourceUrl = 'https://open.spotify.com';
  protected rateLimiter = new RateLimiter(30, 1); // 30 requests per second
  private baseUrl = 'https://api.spotify.com/v1';
  private clientId = process.env.SPOTIFY_CLIENT_ID!;
  private clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  private token: SpotifyToken | null = null;

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiry_time) {
      return this.token.access_token;
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    this.token = {
      ...data,
      expiry_time: Date.now() + (data.expires_in * 1000)
    };

    return this.token.access_token;
  }

  protected async fetchWithCache<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken();
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    return super.fetchWithCache<T>(fullUrl, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  }

  public async searchMedia(query: string): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: SpotifySearchOptions): Promise<MediaReference[]>;
  public async searchMedia(query: string, options: SpotifySearchOptions = {}): Promise<MediaReference[]> {
    const {
      type = ['album'],
      market = 'US',
      limit = 20,
      offset = 0
    } = options;

    const params = new URLSearchParams({
      q: query,
      type: type.join(','),
      market,
      limit: limit.toString(),
      offset: offset.toString()
    });

    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/search?${params}`
    );

    // Combine and transform results based on types
    const results: MediaReference[] = [];

    if (data.albums?.items) {
      results.push(...data.albums.items.map(this.transformSpotifyAlbum.bind(this)));
    }
    if (data.artists?.items) {
      results.push(...data.artists.items.map(this.transformSpotifyArtist.bind(this)));
    }
    if (data.tracks?.items) {
      results.push(...data.tracks.items.map(this.transformSpotifyTrack.bind(this)));
    }

    return results;
  }

  public async getMediaDetails(id: string, type: 'album' | 'artist' | 'track' = 'album'): Promise<MediaReference> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/${type}s/${id}`
    );

    switch (type) {
      case 'album':
        return this.transformSpotifyAlbum(data);
      case 'artist':
        return this.transformSpotifyArtist(data);
      case 'track':
        return this.transformSpotifyTrack(data);
    }
  }

  public async getTrendingMedia(): Promise<MediaReference[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/browse/new-releases?country=US&limit=20`
    );

    return data.albums.items.map(this.transformSpotifyAlbum.bind(this));
  }

  public async getPopularMedia(): Promise<MediaReference[]> {
    // Using featured playlists as a proxy for popularity
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/browse/featured-playlists?country=US&limit=20`
    );

    return data.playlists.items.map(this.transformSpotifyPlaylist.bind(this));
  }

  public async getNewReleases(limit: number = 20): Promise<NewsItem[]> {
    const data = await this.fetchWithCache<any>(
      `${this.baseUrl}/browse/new-releases?limit=${limit}&country=US`
    );
  
    return data.albums.items.map((item: any) => ({
      id: item.id,
      title: item.name,
      description: `New release by ${item.artists.map((a: any) => a.name).join(', ')}`,
      imageUrl: item.images[0]?.url,
      url: item.external_urls.spotify,
      publishedAt: item.release_date,
      source: 'Spotify',
      type: 'new_release'
    }));
  }

  private transformSpotifyAlbum(album: any): MediaReference {
    return {
      internalId: undefined,
      externalId: album.id,
      externalSource: this.source,
      title: album.name,
      description: `Album by ${album.artists.map((a: any) => a.name).join(', ')}`,
      mediaType: 'music',
      releaseDate: album.release_date ? new Date(album.release_date) : undefined,
      coverImage: album.images[0]?.url,
      averageRating: album.popularity ? album.popularity / 20 : undefined, // Convert 0-100 to 0-5
      totalReviews: undefined, // Spotify doesn't provide review counts
      attribution: this.createAttribution(`https://open.spotify.com/album/${album.id}`),
      referenceData: {
        type: 'album',
        artists: album.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          uri: artist.uri
        })),
        totalTracks: album.total_tracks,
        albumType: album.album_type,
        genres: album.genres || [],
        copyrights: album.copyrights,
        externalUrls: album.external_urls,
        popularity: album.popularity,
        tracks: album.tracks?.items
      }
    };
  }

  private transformSpotifyArtist(artist: any): MediaReference {
    return {
      internalId: undefined,
      externalId: artist.id,
      externalSource: this.source,
      title: artist.name,
      description: `Artist with ${artist.followers?.total.toLocaleString()} followers`,
      mediaType: 'music',
      coverImage: artist.images[0]?.url,
      averageRating: artist.popularity ? artist.popularity / 20 : undefined,
      attribution: this.createAttribution(`https://open.spotify.com/artist/${artist.id}`),
      referenceData: {
        type: 'artist',
        genres: artist.genres || [],
        followers: artist.followers,
        popularity: artist.popularity,
        externalUrls: artist.external_urls
      }
    };
  }

  private transformSpotifyTrack(track: any): MediaReference {
    return {
      internalId: undefined,
      externalId: track.id,
      externalSource: this.source,
      title: track.name,
      description: `Track by ${track.artists.map((a: any) => a.name).join(', ')}`,
      mediaType: 'music',
      releaseDate: track.album?.release_date ? new Date(track.album.release_date) : undefined,
      coverImage: track.album?.images[0]?.url,
      averageRating: track.popularity ? track.popularity / 20 : undefined,
      attribution: this.createAttribution(`https://open.spotify.com/track/${track.id}`),
      referenceData: {
        type: 'track',
        artists: track.artists,
        album: track.album,
        duration: track.duration_ms,
        explicit: track.explicit,
        previewUrl: track.preview_url,
        popularity: track.popularity,
        externalUrls: track.external_urls
      }
    };
  }

  private transformSpotifyPlaylist(playlist: any): MediaReference {
    return {
      internalId: undefined,
      externalId: playlist.id,
      externalSource: this.source,
      title: playlist.name,
      description: playlist.description,
      mediaType: 'music',
      coverImage: playlist.images[0]?.url,
      attribution: this.createAttribution(`https://open.spotify.com/playlist/${playlist.id}`),
      referenceData: {
        type: 'playlist',
        owner: playlist.owner,
        totalTracks: playlist.tracks?.total,
        isPublic: playlist.public,
        collaborative: playlist.collaborative,
        externalUrls: playlist.external_urls
      }
    };
  }

  // Additional utility methods
  public async getArtistTopTracks(artistId: string, market: string = 'US'): Promise<any> {
    return this.fetchWithCache<any>(
      `${this.baseUrl}/artists/${artistId}/top-tracks?market=${market}`
    );
  }

  public async getRelatedArtists(artistId: string): Promise<any> {
    return this.fetchWithCache<any>(
      `${this.baseUrl}/artists/${artistId}/related-artists`
    );
  }
}