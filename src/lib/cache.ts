interface CacheOptions {
  maxAge?: number;
  staleWhileRevalidate?: number;
}

export function generateCacheHeaders(options: CacheOptions = {}) {
  const { maxAge = 60, staleWhileRevalidate = 30 } = options;

  return {
    'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  };
}