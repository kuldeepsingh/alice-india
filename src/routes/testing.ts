// @ts-nocheck
/**
 * Testing Routes
 * Run backend tests and diagnostics
 */

import { Router, Request, Response } from 'express'
import { requireAdmin } from '../middleware/rbac.ts'
import { TestingService } from '../services/testing-service.ts'

const router = Router()

/**
 * POST /api/v1/testing/run-all
 * Run all tests
 */
router.post('/run-all', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'system'

    const results = await TestingService.runAllTests(userId)

    res.json({
      status: 'success',
      data: results,
      summary: TestingService.getReportSummary(results),
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * GET /api/v1/testing/health
 * Quick health check
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const results = await TestingService.runAllTests('system')

    const isHealthy = results.failed === 0

    res.json({
      status: 'success',
      healthy: isHealthy,
      passed: results.passed,
      failed: results.failed,
      totalTests: results.totalTests,
    })
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      healthy: false,
      message: error.message,
    })
  }
})

export default router
