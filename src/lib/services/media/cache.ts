export interface CacheConfig {
  maxAge: number;      // Maximum age in seconds
  source: string;      // API source identifier
}

const DEFAULT_CACHE_CONFIG: Record<string, CacheConfig> = {
  tmdb: {
    maxAge: 24 * 60 * 60,  // 24 hours
    source: 'TMDB'
  },
  rawg: {
    maxAge: 24 * 60 * 60,  // 24 hours
    source: 'RAWG'
  },
  google_books: {
    maxAge: 7 * 24 * 60 * 60,  // 7 days
    source: 'Google Books'
  },
  lastfm: {
    maxAge: 60 * 60,  // 1 hour
    source: 'Last.fm'
  },
  comic_vine: {
    maxAge: 24 * 60 * 60,  // 24 hours
    source: 'Comic Vine'
  }
};

export class APICache {
  private cache: Map<string, { data: any; timestamp: number; source: string }>;

  constructor() {
    this.cache = new Map();
  }

  async get<T>(key: string, source: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const config = DEFAULT_CACHE_CONFIG[source];
    if (!config) return null;

    const age = (Date.now() - cached.timestamp) / 1000;
    if (age > config.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  set(key: string, data: any, source: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      source
    });
  }

  clear(source?: string): void {
    if (source) {
      // Clear only entries from specific source
      for (const [key, value] of this.cache.entries()) {
        if (value.source === source) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

export const apiCache = new APICache();