// @ts-nocheck
/**
 * Errors API Routes
 * Endpoints for error tracking, grouping, and management
 */

import { Router, Request, Response } from 'express'
import { ErrorService } from '../services/error-service.ts'
import { logger } from '../services/logger.ts'
import { requireAdmin, requireDeveloper } from '../middleware/rbac.ts'

const router = Router()

/**
 * POST /api/v1/errors
 * Track a new error (usually called internally)
 * @protected Admin only
 */
router.post('/', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const { title, message, stackTrace, context } = req.body

    // Validate required fields
    if (!title || !message || !stackTrace) {
      return res.status(400).json({
        status: 'error',
        message: 'title, message, and stackTrace are required',
        correlationId: req.correlationId,
      })
    }

    const userId = (req as any).user?.id
    const error = await ErrorService.trackError(
      { title, message, stackTrace, context },
      userId,
      req.ip
    )

    res.status(201).json({
      status: 'success',
      data: error,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'POST /errors',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to track error',
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/v1/errors
 * Get grouped errors with filtering
 * @protected Developer or Admin
 * @query status - Filter by status (new, investigating, resolved)
 * @query assignedTo - Filter by assigned developer user ID
 * @query sortBy - Sort by (occurrence, timestamp, affectedUsers)
 * @query limit - Results per page (default 50)
 * @query offset - Pagination offset (default 0)
 */
router.get('/', requireDeveloper(), async (req: Request, res: Response) => {
  try {
    const filter = {
      status: req.query.status as string | undefined,
      assignedTo: req.query.assignedTo as string | undefined,
      sortBy: (req.query.sortBy as 'occurrence' | 'timestamp' | 'affectedUsers') || 'timestamp',
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    }

    const result = await ErrorService.getErrors(filter)

    res.status(200).json({
      status: 'success',
      data: result.data,
      stats: {
        total: result.total,
        errorRate: `${result.errorRate} errors/hour`,
        topErrors: result.topErrors.slice(0, 5),
      },
      pagination: {
        total: result.total,
        page: Math.floor(result.pagination?.page ?? 0),
        pageSize: result.pagination?.pageSize ?? 50,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'GET /errors',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve errors',
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/v1/errors/:id
 * Get error details by ID
 * @protected Developer or Admin
 * @param id - Error ID
 */
router.get('/:id', requireDeveloper(), async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const error = await ErrorService.getErrorById(id)

    res.status(200).json({
      status: 'success',
      data: error,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: 'Error not found',
        correlationId: req.correlationId,
      })
    }

    logger.error({
      type: 'api_error',
      endpoint: 'GET /errors/:id',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve error',
      correlationId: req.correlationId,
    })
  }
})

/**
 * PUT /api/v1/errors/:id
 * Update error status and assignment
 * @protected Admin only
 * @param id - Error ID
 * @body status - New status (new, investigating, resolved)
 * @body assignedTo - Developer user ID to assign to
 */
router.put('/:id', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, assignedTo } = req.body

    if (!status && !assignedTo) {
      return res.status(400).json({
        status: 'error',
        message: 'status or assignedTo must be provided',
        correlationId: req.correlationId,
      })
    }

    const error = await ErrorService.updateError(id, { status, assignedTo })

    res.status(200).json({
      status: 'success',
      data: error,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: 'Error not found',
        correlationId: req.correlationId,
      })
    }

    logger.error({
      type: 'api_error',
      endpoint: 'PUT /errors/:id',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to update error',
      correlationId: req.correlationId,
    })
  }
})

export default router
