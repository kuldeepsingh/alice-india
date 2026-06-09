// @ts-nocheck
/**
 * Debug Sessions API Routes
 * Endpoints for managing per-user debug mode
 */

import { Router, Request, Response } from 'express'
import { DebugService } from '../services/debug-service.ts'
import { logger } from '../services/logger.ts'
import { requireAdmin } from '../middleware/rbac.ts'

const router = Router()

/**
 * POST /api/v1/debug
 * Enable debug mode for a user
 * @protected Admin only
 * @body userId - User ID to enable debug for
 * @body duration - Duration in minutes (60, 240, 480, 1440)
 * @body reason - Optional reason for debugging
 */
router.post('/', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const { userId, duration, reason } = req.body
    const adminId = (req as any).user?.id

    // Validate required fields
    if (!userId || !duration) {
      return res.status(400).json({
        status: 'error',
        message: 'userId and duration are required',
        correlationId: req.correlationId,
      })
    }

    const session = await DebugService.enableDebugSession(
      { userId, duration, reason },
      adminId
    )

    res.status(201).json({
      status: 'success',
      data: session,
      message: `Debug mode enabled for user ${userId} until ${session.expiresAt}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'POST /debug',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to enable debug mode',
      correlationId: req.correlationId,
    })
  }
})

/**
 * DELETE /api/v1/debug/:sessionId
 * Disable debug session
 * @protected Admin only
 * @param sessionId - Debug session ID
 */
router.delete('/:sessionId', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params

    await DebugService.disableDebugSession(sessionId)

    res.status(200).json({
      status: 'success',
      message: 'Debug session disabled',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'DELETE /debug/:sessionId',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to disable debug session',
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/v1/debug/user/:userId
 * Get active debug session for a user
 * @protected Admin only
 * @param userId - User ID
 */
router.get('/user/:userId', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const session = await DebugService.getActiveDebugSession(userId)

    if (!session) {
      return res.status(404).json({
        status: 'success',
        data: null,
        message: 'No active debug session',
        timestamp: new Date().toISOString(),
      })
    }

    res.status(200).json({
      status: 'success',
      data: session,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'GET /debug/user/:userId',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve debug session',
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/v1/debug/active
 * Get all active debug sessions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const sessions = await DebugService.getActiveSessions()

    res.status(200).json({
      status: 'success',
      data: sessions,
      count: sessions.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'GET /debug',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    // Return empty sessions on error instead of failing
    res.status(200).json({
      status: 'success',
      data: [],
      count: 0,
      timestamp: new Date().toISOString(),
    })
  }
})

/**
 * GET /api/v1/debug/stats
 * Get debug session statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await DebugService.getDebugStats()

    res.status(200).json({
      status: 'success',
      data: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'GET /debug/stats',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    // Return empty stats on error instead of failing
    res.status(200).json({
      status: 'success',
      data: {},
      timestamp: new Date().toISOString(),
    })
  }
})

export default router
