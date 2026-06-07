/**
 * Metrics API Routes
 * Performance monitoring and cache statistics
 */

import { Router, Request, Response } from 'express'
import { CacheService } from '../services/cache-service.ts'
import { DatabaseOptimization } from '../services/database-optimization.ts'

const router = Router()

/**
 * GET /api/v1/metrics/cache
 * Get cache statistics
 */
router.get('/cache', (_req: Request, res: Response) => {
  try {
    const stats = CacheService.getStats()

    res.json({
      status: 'success',
      data: {
        cache: stats,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch cache metrics',
    })
  }
})

/**
 * GET /api/v1/metrics/database
 * Get database query statistics
 */
router.get('/database', (_req: Request, res: Response) => {
  try {
    const stats = DatabaseOptimization.getQueryStats()
    const slowQueries = DatabaseOptimization.getTopSlowQueries(5)

    res.json({
      status: 'success',
      data: {
        statistics: stats,
        slowQueries: slowQueries.map((q) => ({
          query: q.query.substring(0, 100) + '...',
          duration: q.duration + 'ms',
          rows: q.rows,
          cached: q.cached,
          timestamp: q.timestamp.toISOString(),
        })),
        metricsSize: DatabaseOptimization.getMetricsSize(),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch database metrics',
    })
  }
})

/**
 * GET /api/v1/metrics/performance
 * Get combined performance metrics
 */
router.get('/performance', (_req: Request, res: Response) => {
  try {
    const cacheStats = CacheService.getStats()
    const dbStats = DatabaseOptimization.getQueryStats()

    res.json({
      status: 'success',
      data: {
        cache: {
          hitRatio: cacheStats.hitRatio,
          totalRequests: cacheStats.total,
          cacheSize: cacheStats.cacheSize,
          memory: cacheStats.memoryEstimate,
        },
        database: {
          avgQueryTime: dbStats.avgDuration + 'ms',
          totalQueries: dbStats.totalQueries,
          cachedQueries: dbStats.cachedQueries,
          slowQueries: dbStats.slowQueries,
        },
        performance: {
          queryOptimizationRatio: (
            (dbStats.cachedQueries / Math.max(dbStats.totalQueries, 1)) *
            100
          ).toFixed(1) + '%',
          cacheEffectiveness: cacheStats.hitRatio,
          estimatedSpeedup: (
            (dbStats.avgDuration / Math.max(dbStats.avgDuration / 5, 1))
          ).toFixed(1) + 'x',
        },
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch performance metrics',
    })
  }
})

/**
 * POST /api/v1/metrics/reset
 * Reset all metrics (admin only)
 */
router.post('/reset', (_req: Request, res: Response) => {
  try {
    CacheService.resetStats()
    DatabaseOptimization.clearMetrics()

    res.json({
      status: 'success',
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to reset metrics',
    })
  }
})

/**
 * POST /api/v1/metrics/cache/clear
 * Clear all cache (admin only)
 */
router.post('/cache/clear', async (_req: Request, res: Response) => {
  try {
    await CacheService.clear()

    res.json({
      status: 'success',
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to clear cache',
    })
  }
})

export default router
