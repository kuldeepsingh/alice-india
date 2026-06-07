/**
 * Team API Routes
 * GET, POST endpoints for team coordination and on-call management
 */

import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { OnCallService } from '../services/on-call-service.ts'
import { IncidentService } from '../services/incident-service.ts'
import { requireDeveloper, requireAdmin } from '../middleware/rbac.ts'
import { query } from '../services/database.ts'

const router = Router()

/**
 * GET /api/v1/team/members
 * Get all team members
 * Auth: Developer+
 */
router.get('/members', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT
        id,
        email,
        role,
        created_at
      FROM users
      ORDER BY email ASC
    `

    const result = await query(sql)

    res.status(200).json({
      status: 'success',
      data: result.rows,
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error fetching team members:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch team members',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * GET /api/v1/team/on-call
 * Get on-call schedule
 * Auth: Developer+
 * Query params: startDate, endDate
 */
router.get('/on-call', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query

    const start = startDate ? new Date(startDate as string) : new Date()
    const end = endDate ? new Date(endDate as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const schedule = await OnCallService.getTeamSchedule(start, end)
    const activeOnCall = await OnCallService.getActiveOnCall(new Date())

    res.status(200).json({
      status: 'success',
      data: {
        schedule,
        activeOnCall,
      },
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error fetching on-call schedule:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch on-call schedule',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * POST /api/v1/team/on-call
 * Create on-call schedule
 * Auth: Admin only
 */
router.post('/on-call', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, startDate, endDate, shiftType, notes } = req.body

    if (!userId || !startDate || !endDate || !shiftType) {
      return res.status(400).json({
        status: 'error',
        message: 'userId, startDate, endDate, and shiftType are required',
      })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate no conflicts
    const isValid = await OnCallService.validateNoConflicts(userId, start, end)
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'User already has a primary on-call shift in this date range',
        correlationId: (req as any).correlationId,
      })
    }

    const schedule = await OnCallService.createSchedule(userId, start, end, shiftType, notes)

    res.status(201).json({
      status: 'success',
      data: schedule,
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error creating on-call schedule:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create on-call schedule',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * GET /api/v1/team/metrics
 * Get team metrics and statistics
 * Auth: Developer+
 */
router.get('/metrics', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const onCallMetrics = await OnCallService.getTeamMetrics()
    const incidentStats = await IncidentService.getIncidentStats()

    res.status(200).json({
      status: 'success',
      data: {
        onCall: onCallMetrics,
        incidents: incidentStats,
      },
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error fetching team metrics:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch team metrics',
      correlationId: (req as any).correlationId,
    })
  }
})

export default router
