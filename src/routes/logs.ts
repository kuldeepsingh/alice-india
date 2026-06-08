/**
 * Logs API Routes
 * Endpoints for viewing and managing application logs
 */

import { Router, Request, Response } from 'express'
import { LoggingService } from '../services/logging-service.ts'
import { logger } from '../services/logger.ts'
import { requireAdmin, requireDeveloper } from '../middleware/rbac.ts'

const router = Router()

/**
 * POST /api/v1/logs
 * Store a new log entry (internal use)
 * @protected Admin only
 */
router.post('/', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const { level, message, userId, correlationId, module, context, stackTrace } = req.body

    // Validate required fields
    if (!level || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'level and message are required',
        correlationId: req.correlationId,
      })
    }

    const log = await LoggingService.storeLog({
      level,
      message,
      userId,
      correlationId,
      module,
      context,
      stackTrace,
      ipAddress: req.ip,
      requestId: req.correlationId,
    })

    res.status(201).json({
      status: 'success',
      data: log,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'POST /logs',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to store log',
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/v1/logs
 * Retrieve logs with filtering and pagination
 * @protected Developer or Admin
 * @query userId - Filter by user ID
 * @query level - Filter by log level (DEBUG, INFO, WARN, ERROR, FATAL)
 * @query module - Filter by module
 * @query correlationId - Filter by correlation ID (trace request)
 * @query startDate - Start date (ISO 8601)
 * @query endDate - End date (ISO 8601)
 * @query search - Search in message
 * @query limit - Results per page (default 50)
 * @query offset - Pagination offset (default 0)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filter = {
      userId: req.query.userId as string | undefined,
      level: req.query.level as string | undefined,
      module: req.query.module as string | undefined,
      correlationId: req.query.correlationId as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      search: req.query.search as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    }

    const result = await LoggingService.getLogs(filter)

    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        pages: Math.ceil(result.total / result.pageSize),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'GET /logs',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    // Return empty logs on error instead of failing
    res.status(200).json({
      status: 'success',
      data: [],
      pagination: {
        total: 0,
        page: 0,
        pageSize: 50,
        pages: 0,
      },
      timestamp: new Date().toISOString(),
    })
  }
})

/**
 * GET /api/v1/logs/trace/:correlationId
 * Get all logs for a specific correlation ID (trace request across services)
 * @protected Developer or Admin
 * @param correlationId - Correlation ID to trace
 */
router.get('/trace/:correlationId', requireDeveloper(), async (req: Request, res: Response) => {
  try {
    const { correlationId } = req.params

    const logs = await LoggingService.getLogsByCorrelationId(correlationId)

    res.status(200).json({
      status: 'success',
      data: logs,
      count: logs.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'GET /logs/trace/:correlationId',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve logs by correlation ID',
      correlationId: req.correlationId,
    })
  }
})

export default router
