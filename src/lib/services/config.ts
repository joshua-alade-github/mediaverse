export const serviceConfig = {
  tmdb: {
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
    rateLimit: {
      requests: 40,
      perSeconds: 10
    },
    defaultLanguage: 'en-US',
    defaultRegion: 'US'
  },
  rawg: {
    baseUrl: 'https://api.rawg.io/api',
    rateLimit: {
      requests: 5,
      perSeconds: 1
    }
  },
  googleBooks: {
    baseUrl: 'https://www.googleapis.com/books/v1',
    rateLimit: {
      requests: 1000,
      perMinutes: 60
    }
  },
  spotify: {
    baseUrl: 'https://api.spotify.com/v1',
    authUrl: 'https://accounts.spotify.com/api/token',
    rateLimit: {
      requests: 30,
      perSeconds: 1
    },
    defaultMarket: 'US'
  },
  comicVine: {
    baseUrl: 'https://comicvine.gamespot.com/api',
    rateLimit: {
      requests: 200,
      perHour: 1
    }
  }
} as const;

export const cacheConfig = {
  defaultTTL: 3600, // 1 hour in seconds
  maxSize: 100, // Maximum number of items to cache
  cleanupInterval: 300, // Cleanup every 5 minutes
};

export const searchConfig = {
  minQueryLength: 2,
  maxResults: 20,
  cacheTimeout: 300, // 5 minutes
  defaultSearchFields: ['title', 'description'],
};

export type ServiceConfig = typeof serviceConfig;
export type ServiceName = keyof ServiceConfig;