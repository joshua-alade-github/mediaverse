export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public source?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableStatusCodes?: number[];
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
};

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...defaultRetryOptions, ...options };
  let lastError: Error | null = null;
  let delay = config.initialDelay;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's not a retryable status code
      if (error.statusCode && !config.retryableStatusCodes.includes(error.statusCode)) {
        throw error;
      }

      if (attempt === config.maxRetries) {
        throw new APIError(
          `Operation failed after ${attempt} attempts`,
          error.statusCode,
          error.source,
          lastError
        );
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * config.backoffFactor, config.maxDelay);
    }
  }

  throw lastError || new Error('Operation failed');
}

export function parseError(error: any, source: string): APIError {
  if (error instanceof APIError) {
    return error;
  }

  if (error.response) {
    return new APIError(
      error.response.data?.message || error.message,
      error.response.status,
      source,
      error
    );
  }

  return new APIError(
    error.message || 'An unknown error occurred',
    undefined,
    source,
    error
  );
}

export async function rateLimit(
  fn: () => Promise<any>,
  rateLimiter: { waitForToken: () => Promise<void> }
): Promise<any> {
  await rateLimiter.waitForToken();
  return fn();
}

export function createQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
          .join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}