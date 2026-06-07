/**
 * Cache Service
 * Redis-based caching for performance optimization
 */

export interface CacheOptions {
  ttl?: number // seconds
  compress?: boolean
}

export interface CacheKey {
  key: string
  ttl: number
}

// Cache key prefixes for organization
const CACHE_KEYS = {
  INCIDENTS: 'incidents',
  NOTIFICATIONS: 'notifications',
  TEAM: 'team',
  STATS: 'stats',
  USER: 'user',
  SESSION: 'session',
  DEBUG: 'debug',
} as const

// Default TTL values (in seconds)
const DEFAULT_TTLS = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 24 * 60 * 60, // 24 hours
  REALTIME: 1 * 60, // 1 minute
} as const

export class CacheService {
  private static cache = new Map<string, { value: any; expires: number }>()
  private static hitCount = 0
  private static missCount = 0

  /**
   * Get value from cache
   */
  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const entry = this.cache.get(key)

      if (!entry) {
        this.missCount++
        return null
      }

      if (Date.now() > entry.expires) {
        this.cache.delete(key)
        this.missCount++
        return null
      }

      this.hitCount++
      return entry.value as T
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error)
      return null
    }
  }

  /**
   * Set value in cache
   */
  static async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || DEFAULT_TTLS.MEDIUM
      const expires = Date.now() + ttl * 1000

      this.cache.set(key, {
        value,
        expires,
      })
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error)
    }
  }

  /**
   * Delete value from cache
   */
  static async delete(key: string): Promise<void> {
    try {
      this.cache.delete(key)
    } catch (error) {
      console.error(`Cache DELETE error for key ${key}:`, error)
    }
  }

  /**
   * Delete keys by pattern
   */
  static async deletePattern(pattern: string): Promise<number> {
    try {
      let deleted = 0
      const regex = new RegExp(pattern)

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key)
          deleted++
        }
      }

      return deleted
    } catch (error) {
      console.error(`Cache DELETE PATTERN error for pattern ${pattern}:`, error)
      return 0
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    try {
      this.cache.clear()
    } catch (error) {
      console.error('Cache CLEAR error:', error)
    }
  }

  /**
   * Get or compute value
   */
  static async getOrSet<T = any>(
    key: string,
    compute: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }

      // Compute value
      const value = await compute()

      // Store in cache
      await this.set(key, value, options)

      return value
    } catch (error) {
      console.error(`Cache GET_OR_SET error for key ${key}:`, error)
      // If cache fails, still compute the value
      return await compute()
    }
  }

  /**
   * Set multiple values
   */
  static async setMultiple(
    entries: Array<[string, any, CacheOptions?]>
  ): Promise<void> {
    try {
      for (const [key, value, options] of entries) {
        await this.set(key, value, options)
      }
    } catch (error) {
      console.error('Cache SETMULTIPLE error:', error)
    }
  }

  /**
   * Get statistics
   */
  static getStats() {
    const total = this.hitCount + this.missCount
    const hitRatio = total === 0 ? 0 : (this.hitCount / total) * 100

    return {
      hits: this.hitCount,
      misses: this.missCount,
      total,
      hitRatio: hitRatio.toFixed(2) + '%',
      cacheSize: this.cache.size,
      memoryEstimate: this.estimateMemory(),
    }
  }

  /**
   * Reset statistics
   */
  static resetStats() {
    this.hitCount = 0
    this.missCount = 0
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private static estimateMemory(): string {
    let bytes = 0

    for (const entry of this.cache.values()) {
      bytes += JSON.stringify(entry.value).length
    }

    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // Convenience methods for common cache operations

  static getIncidentsKey(status?: string): string {
    return `${CACHE_KEYS.INCIDENTS}:${status || 'all'}`
  }

  static getNotificationsKey(userId: string, type?: string): string {
    return `${CACHE_KEYS.NOTIFICATIONS}:${userId}:${type || 'all'}`
  }

  static getTeamScheduleKey(date: string): string {
    return `${CACHE_KEYS.TEAM}:schedule:${date}`
  }

  static getStatsKey(type: string): string {
    return `${CACHE_KEYS.STATS}:${type}`
  }

  static getUserKey(userId: string): string {
    return `${CACHE_KEYS.USER}:${userId}`
  }

  static getSessionKey(sessionId: string): string {
    return `${CACHE_KEYS.SESSION}:${sessionId}`
  }

  static getDebugKey(type: string): string {
    return `${CACHE_KEYS.DEBUG}:${type}`
  }

  // Cache invalidation helpers

  static async invalidateIncidents(status?: string): Promise<void> {
    if (status) {
      await this.delete(this.getIncidentsKey(status))
    } else {
      await this.deletePattern(`^${CACHE_KEYS.INCIDENTS}:`)
    }
  }

  static async invalidateNotifications(userId?: string): Promise<void> {
    if (userId) {
      await this.deletePattern(`^${CACHE_KEYS.NOTIFICATIONS}:${userId}:`)
    } else {
      await this.deletePattern(`^${CACHE_KEYS.NOTIFICATIONS}:`)
    }
  }

  static async invalidateTeamSchedule(): Promise<void> {
    await this.deletePattern(`^${CACHE_KEYS.TEAM}:`)
  }

  static async invalidateStats(): Promise<void> {
    await this.deletePattern(`^${CACHE_KEYS.STATS}:`)
  }

  static async invalidateUser(userId: string): Promise<void> {
    await this.delete(this.getUserKey(userId))
  }

  static async invalidateSession(sessionId: string): Promise<void> {
    await this.delete(this.getSessionKey(sessionId))
  }
}
