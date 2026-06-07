/**
 * Cache Configuration
 * Redis and caching strategies
 */

import type { AppEnvironment } from './env'

export interface CacheConfig {
  redisUrl: string
  defaultTtl: number
  strategies: {
    session: number
    user: number
    account: number
    order: number
    marketData: number
  }
  keys: {
    prefix: string
    separator: string
  }
}

/**
 * Create cache configuration from environment
 */
export function createCacheConfig(env: AppEnvironment): CacheConfig {
  return {
    redisUrl: env.redisUrl,
    defaultTtl: env.cacheDefaultTtl, // in seconds

    strategies: {
      session: 3600, // 1 hour
      user: 1800, // 30 minutes
      account: 1800, // 30 minutes
      order: 300, // 5 minutes
      marketData: 60, // 1 minute
    },

    keys: {
      prefix: 'bot-trade',
      separator: ':',
    },
  }
}

/**
 * Cache key builder
 */
export const CacheKeys = {
  // Sessions
  session: (sessionId: string) => `session:${sessionId}`,
  user: (userId: string) => `user:${userId}`,
  userAccounts: (userId: string) => `user:${userId}:accounts`,

  // Trading data
  account: (accountId: string) => `account:${accountId}`,
  accountOrders: (accountId: string) => `account:${accountId}:orders`,
  order: (orderId: string) => `order:${orderId}`,

  // Market data
  marketData: (symbol: string) => `market:${symbol}`,
  quote: (symbol: string) => `quote:${symbol}`,


  // Counters
  orderCount: (userId: string) => `counter:orders:${userId}`,
}

/**
 * Cache invalidation patterns
 */
export const CacheInvalidation = {
  onUserUpdate: (userId: string) => [
    CacheKeys.user(userId),
    CacheKeys.userAccounts(userId),
  ],

  onAccountUpdate: (accountId: string) => [
    CacheKeys.account(accountId),
    CacheKeys.accountOrders(accountId),
  ],

  onOrderCreate: (userId: string, accountId: string) => [
    CacheKeys.userAccounts(userId),
    CacheKeys.accountOrders(accountId),
    CacheKeys.orderCount(userId),
  ],

  onMarketDataUpdate: (symbol: string) => [
    CacheKeys.marketData(symbol),
    CacheKeys.quote(symbol),
  ],
}
