/**
 * Async utility helpers for controlled concurrency and retry logic.
 *
 * Used by the Rule Builder save flow to parallelize API calls safely
 * without overwhelming the backend or browser connection pool.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Concurrency Limiter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a concurrency limiter that restricts the number of
 * simultaneously executing async tasks.
 *
 * @example
 * ```ts
 * const limit = createConcurrencyLimiter(5);
 * const results = await Promise.all(
 *   items.map((item) => limit(() => processItem(item)))
 * );
 * ```
 */
export function createConcurrencyLimiter(maxConcurrent: number) {
  let activeCount = 0;
  const waitQueue: Array<() => void> = [];

  const tryRunNext = () => {
    if (waitQueue.length > 0 && activeCount < maxConcurrent) {
      activeCount++;
      const release = waitQueue.shift()!;
      release();
    }
  };

  return async <T>(fn: () => Promise<T>): Promise<T> => {
    // Wait until a concurrency slot is available
    await new Promise<void>((resolve) => {
      waitQueue.push(resolve);
      tryRunNext();
    });

    try {
      return await fn();
    } finally {
      activeCount--;
      tryRunNext();
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Retry with Exponential Backoff
// ─────────────────────────────────────────────────────────────────────────────

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in ms before first retry (default: 500) */
  baseDelayMs?: number;
  /** Maximum delay cap in ms (default: 5000) */
  maxDelayMs?: number;
}

/**
 * Wraps an async function with automatic retry + exponential backoff.
 *
 * Delay formula: min(baseDelay × 2^attempt + jitter, maxDelay)
 * The jitter (0–200 ms) prevents thundering-herd on retries.
 *
 * @example
 * ```ts
 * const data = await withRetry(() => api.post('/endpoint', payload), {
 *   maxRetries: 3,
 *   baseDelayMs: 500,
 * });
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 500, maxDelayMs = 5000 } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
        const jitter = Math.random() * 200;
        const delay = Math.min(exponentialDelay + jitter, maxDelayMs);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
