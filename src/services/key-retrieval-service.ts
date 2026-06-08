/**
 * Key Retrieval Service
 * 
 * Fetches encrypted API keys from the database using internal endpoints.
 * Used by order creation, Claude features, and other services that need credentials.
 * 
 * This service:
 * - Calls internal backend endpoints to retrieve decrypted keys
 * - Only used internally (never exposed to frontend)
 * - Caches keys temporarily for performance
 * - Logs all key access for audit trail
 */

import { logger } from './logger'

const INTERNAL_API_BASE = 'http://localhost:3000/api/v1'

interface RetrievedKeys {
  zerodha?: { key: string; secret: string }
  claude?: string
}

export class KeyRetrievalService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeoutMs = 5 * 60 * 1000 // 5 minutes

  /**
   * Get Zerodha API credentials for a user
   */
  async getZerodhaCredentials(userId: string): Promise<{ key: string; secret: string } | null> {
    try {
      const cached = this.getCached(userId, 'zerodha')
      if (cached) {
        logger.debug({
          type: 'zerodha_credentials_cached',
          userId,
        })
        return cached
      }

      // Call internal endpoint to decrypt and retrieve Zerodha key
      const response = await fetch(`${INTERNAL_API_BASE}/user/api-keys/internal/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          keyType: 'zerodha',
        }),
      })

      if (!response.ok) {
        logger.warn({
          type: 'zerodha_credentials_not_found',
          userId,
          status: response.status,
        })
        return null
      }

      const data = await response.json()

      if (!data.data) {
        return null
      }

      // Cache the credentials temporarily
      const credentials = { key: data.data.key, secret: data.data.secret }
      this.setCached(userId, 'zerodha', credentials)

      logger.info({
        type: 'zerodha_credentials_retrieved',
        userId,
      })

      return credentials
    } catch (error) {
      logger.error({
        type: 'zerodha_credentials_retrieval_error',
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  }

  /**
   * Get Claude API key for a user
   */
  async getClaudeApiKey(userId: string): Promise<string | null> {
    try {
      const cached = this.getCached(userId, 'claude')
      if (cached) {
        logger.debug({
          type: 'claude_key_cached',
          userId,
        })
        return cached
      }

      // Call internal endpoint to decrypt and retrieve Claude key
      const response = await fetch(`${INTERNAL_API_BASE}/user/api-keys/internal/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          keyType: 'claude',
        }),
      })

      if (!response.ok) {
        logger.warn({
          type: 'claude_key_not_found',
          userId,
          status: response.status,
        })
        return null
      }

      const data = await response.json()

      if (!data.data) {
        return null
      }

      // Cache the key temporarily
      const apiKey = typeof data.data === 'string' ? data.data : data.data.key
      this.setCached(userId, 'claude', apiKey)

      logger.info({
        type: 'claude_key_retrieved',
        userId,
      })

      return apiKey
    } catch (error) {
      logger.error({
        type: 'claude_key_retrieval_error',
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  }

  /**
   * Clear cache for a user
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(`${userId}:zerodha`)
      this.cache.delete(`${userId}:claude`)
      logger.debug({ type: 'user_key_cache_cleared', userId })
    } else {
      this.cache.clear()
      logger.debug({ type: 'all_key_cache_cleared' })
    }
  }

  /**
   * Private: Get from cache
   */
  private getCached(userId: string, keyType: string): any | null {
    const key = `${userId}:${keyType}`
    const cached = this.cache.get(key)

    if (!cached) {
      return null
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.cacheTimeoutMs) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Private: Set in cache
   */
  private setCached(userId: string, keyType: string, data: any): void {
    const key = `${userId}:${keyType}`
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }
}

export const keyRetrievalService = new KeyRetrievalService()
