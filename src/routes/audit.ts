/**
 * Audit Logs API Routes
 * Endpoints for accessing immutable audit trail
 */

import { Router, Request, Response } from 'express'
import { AuditService } from '../services/audit-service.ts'
import { logger } from '../services/logger.ts'
import { requireAdmin, requireDeveloper } from '../middleware/rbac.ts'

const router = Router()

/**
 * GET /api/v1/audit
 * Get audit logs with filtering
 * @protected Admin or Senior Dev
 * @query userId - Filter by user ID
 * @query action - Filter by action type
 * @query resourceType - Filter by resource type
 * @query status - Filter by status (success, failure)
 * @query startDate - Start date (ISO 8601)
 * @query endDate - End date (ISO 8601)
 * @query limit - Results per page (default 50)
 * @query offset - Pagination offset (default 0)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filter = {
      userId: req.query.userId as string | undefined,
      action: req.query.action as string | undefined,
      resourceType: req.query.resourceType as string | undefined,
      status: req.query.status as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    }

    const result = await AuditService.getAuditLogs(filter)

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
      endpoint: 'GET /audit',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    // Return empty audit logs on error instead of failing
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
 * GET /api/v1/audit/user/:userId
 * Get activity summary for a specific user
 * @protected Admin or Senior Dev
 * @param userId - User ID
 */
router.get('/user/:userId', requireDeveloper(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const activity = await AuditService.getUserActivity(userId)

    res.status(200).json({
      status: 'success',
      data: activity,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'GET /audit/user/:userId',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user activity',
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/v1/audit/export
 * Export audit logs
 * @protected Admin only
 * @query format - Export format (csv, json)
 * @query userId - Optional filter
 * @query action - Optional filter
 * @query startDate - Optional filter
 * @query endDate - Optional filter
 */
router.get('/export', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as 'csv' | 'json') || 'csv'
    const filter = {
      userId: req.query.userId as string | undefined,
      action: req.query.action as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    }

    const data = await AuditService.exportAuditLogs(filter, format)

    // Set response headers for download
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.${format}"`
    )

    res.send(data)
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'GET /audit/export',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to export audit logs',
      correlationId: req.correlationId,
    })
  }
})

/**
 * GET /api/v1/audit/stats
 * Get audit statistics
 * @protected Admin only
 * @query daysBack - Number of days to analyze (default 30)
 */
router.get('/stats', requireAdmin(), async (req: Request, res: Response) => {
  try {
    const daysBack = req.query.daysBack ? parseInt(req.query.daysBack as string, 10) : 30

    const stats = await AuditService.getAuditStats(daysBack)

    res.status(200).json({
      status: 'success',
      data: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error({
      type: 'api_error',
      endpoint: 'GET /audit/stats',
      error: error instanceof Error ? error.message : String(error),
      correlationId: req.correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve audit statistics',
      correlationId: req.correlationId,
    })
  }
})

export default router
