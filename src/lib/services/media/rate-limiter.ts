export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly refillInterval: number; // milliseconds
  private queue: Array<() => void> = [];

  constructor(
    maxRequestsPerInterval: number,
    intervalInSeconds: number
  ) {
    this.maxTokens = maxRequestsPerInterval;
    this.tokens = maxRequestsPerInterval;
    this.lastRefill = Date.now();
    this.refillRate = maxRequestsPerInterval / intervalInSeconds;
    this.refillInterval = 1000; // Refill every second
    
    // Start the token refill process
    this.startRefillProcess();
  }

  private startRefillProcess() {
    setInterval(() => {
      this.refillTokens();
      this.processQueue();
    }, this.refillInterval);
  }

  private refillTokens() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / 1000) * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  private processQueue() {
    while (this.queue.length > 0 && this.tokens >= 1) {
      const resolve = this.queue.shift();
      if (resolve) {
        this.tokens -= 1;
        resolve();
      }
    }
  }

  async waitForToken(): Promise<void> {
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  // Helper method to get current token count (useful for debugging)
  getTokenCount(): number {
    return this.tokens;
  }

  // Helper method to get queue length (useful for debugging)
  getQueueLength(): number {
    return this.queue.length;
  }
}