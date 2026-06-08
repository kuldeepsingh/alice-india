/**
 * Cache Middleware
 * Handles HTTP caching headers and response caching for GET requests
 */

import { Request, Response, NextFunction } from 'express'
import { CacheService } from '../services/cache-service.ts'
import crypto from 'crypto'

/**
 * Generate ETag for response
 */
function generateETag(data: string): string {
  return `"${crypto.createHash('md5').update(data).digest('hex')}"`
}

/**
 * Cache response middleware
 */
export function cacheResponseMiddleware(maxAge: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // Generate cache key from method, path, and query
    const cacheKey = `http:${req.method}:${req.path}:${JSON.stringify(req.query)}`

    // Store original response.json
    const originalJson = res.json.bind(res)

    // Override res.json to cache response
    res.json = function (data: any) {
      const dataStr = JSON.stringify(data)
      const etag = generateETag(dataStr)

      // Set cache headers
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`)
      res.setHeader('ETag', etag)
      res.setHeader('X-Cache-Key', cacheKey)

      // Check If-None-Match header
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end()
      }

      // Store in cache asynchronously
      CacheService.set(cacheKey, data, { ttl: maxAge }).catch((err) =>
        console.error('Cache store error:', err)
      )

      return originalJson(data)
    }

    next()
  }
}

/**
 * Request deduplication middleware
 * Prevents duplicate concurrent requests for the same resource
 */
export function deduplicationMiddleware() {
  const pendingRequests = new Map<string, Promise<any>>()

  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next()
    }

    const requestKey = `${req.method}:${req.path}:${JSON.stringify(req.query)}`

    // If request is already pending, wait for it
    if (pendingRequests.has(requestKey)) {
      try {
        const result = await pendingRequests.get(requestKey)
        // Send cached result
        return res.json(result)
      } catch (error) {
        console.error('Deduplication error:', error)
        return next()
      }
    }

    // Store response promise
    const responsePromise = new Promise((resolve, reject) => {
      const originalJson = res.json.bind(res)

      res.json = function (data: any) {
        // Resolve promise with data
        resolve(data)
        // Send response
        return originalJson(data)
      }

      // Move to next middleware
      next()
    })

    pendingRequests.set(requestKey, responsePromise)

    // Clean up after request completes
    responsePromise
      .finally(() => {
        pendingRequests.delete(requestKey)
      })
      .catch(() => {
        pendingRequests.delete(requestKey)
      })
  }
}

/**
 * Performance tracking middleware
 */
export function performanceTrackingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()

    // Track when response is sent
    const originalSend = res.send.bind(res)
    res.send = function (data: any) {
      const duration = Date.now() - startTime
      const slow = duration > 200 ? 'SLOW' : 'FAST'

      // Add performance headers
      res.setHeader('X-Response-Time', `${duration}ms`)
      res.setHeader('X-Response-Speed', slow)

      // Log slow requests
      if (duration > 200) {
        console.warn(`[SLOW] ${req.method} ${req.path} took ${duration}ms`)
      }

      return originalSend(data)
    }

    next()
  }
}

/**
 * Cache invalidation middleware
 * Automatically invalidates related caches on mutations
 */
export function cacheInvalidationMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only handle mutations
    if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
      return next()
    }

    // Invalidate relevant caches based on route
    const path = req.path

    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Success - invalidate caches

        if (path.includes('/incidents')) {
          CacheService.invalidateIncidents().catch((err) =>
            console.error('Cache invalidation error:', err)
          )
        }

        if (path.includes('/notifications')) {
          const userId = (req as any).user?.id
          if (userId) {
            CacheService.invalidateNotifications(userId).catch((err) =>
              console.error('Cache invalidation error:', err)
            )
          }
        }

        if (path.includes('/team/on-call')) {
          CacheService.invalidateTeamSchedule().catch((err) =>
            console.error('Cache invalidation error:', err)
          )
        }

        if (path.includes('/stats')) {
          CacheService.invalidateStats().catch((err) =>
            console.error('Cache invalidation error:', err)
          )
        }
      }
    })

    next()
  }
}

/**
 * Compression middleware (gzip)
 */
export function compressionMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res)

    res.json = function (data: any) {
      // Add compression headers
      if (req.headers['accept-encoding']?.includes('gzip')) {
        res.setHeader('Content-Encoding', 'gzip')
      }

      return originalJson(data)
    }

    next()
  }
}

/**
 * Cache statistics endpoint middleware
 */
export function cacheStatsMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add stats to response locals
    res.locals.cacheStats = CacheService.getStats()

    // Add header with cache stats
    res.setHeader('X-Cache-Stats', JSON.stringify(res.locals.cacheStats))

    next()
  }
}
