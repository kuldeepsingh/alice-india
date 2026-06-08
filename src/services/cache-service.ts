/**
 * Cache Service
 *
 * Provides in-memory caching with TTL support.
 * Used by Claude service to cache market context, reducing API calls and costs.
 *
 * Cache Hierarchy:
 * 1. Memory cache (this service) - fastest, per-instance
 * 2. Redis cache (future) - shared across instances
 * 3. Database cache (future) - persistent, slow
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private maxSize = 1000 // Max entries before cleanup
  private cleanupInterval = 60000 // Clean every 60 seconds

  constructor() {
    // Periodically clean expired entries
    setInterval(() => this.cleanup(), this.cleanupInterval)
  }

  /**
   * Get value from cache
   *
   * @param key - Cache key
   * @returns Cached value or null if expired/missing
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  /**
   * Set value in cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - Time to live in seconds
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    // Cleanup if cache is too large
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const expiresAt = Date.now() + ttlSeconds * 1000

    this.cache.set(key, {
      value,
      expiresAt,
    })
  }

  /**
   * Delete value from cache
   *
   * @param key - Cache key
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    this.cache.clear()
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    }
  }

  /**
   * Clean up expired entries
   * Called periodically and when cache is full
   */
  private cleanup(): void {
    const now = Date.now()
    let deletedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        deletedCount++
      }
    }

    if (deletedCount > 0) {
      console.log(`[CacheService] Cleaned ${deletedCount} expired entries`)
    }
  }
}

export const cacheService = new CacheService()
