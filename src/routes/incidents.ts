// @ts-nocheck
/**
 * Incident API Routes
 * POST, GET, PUT endpoints for incident management
 */

import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { IncidentService } from '../services/incident-service.js'
import { requireDeveloper, requireAdmin } from '../middleware/rbac.js'
import { CreateIncidentInput, IncidentStatus } from '../models/incident.js'

const router = Router()

/**
 * POST /api/v1/incidents
 * Create a new incident
 * Auth: Admin only
 */
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, severity, relatedErrorId } = req.body
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' })
    }

    if (!title || !severity) {
      return res.status(400).json({
        status: 'error',
        message: 'title and severity are required',
      })
    }

    const input: CreateIncidentInput = {
      title,
      description,
      severity,
      relatedErrorId,
    }

    const incident = await IncidentService.createIncident(input, userId)

    res.status(201).json({
      status: 'success',
      data: incident,
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error creating incident:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create incident',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * GET /api/v1/incidents
 * List incidents with filtering
 * Auth: Developer+
 * Query params: status, severity, assignedTo, limit, offset
 */
router.get('/', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const { status, severity, assignedTo, createdBy, limit = 50, offset = 0 } = req.query

    const filter = {
      status: status as any,
      severity: severity as any,
      assignedTo: assignedTo as string,
      createdBy: createdBy as string,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0,
    }

    const result = await IncidentService.getIncidents(filter)

    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error fetching incidents:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch incidents',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * GET /api/v1/incidents/:id
 * Get incident details
 * Auth: Developer+
 */
router.get('/:id', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id || !uuidv4.validate(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid incident ID',
      })
    }

    const incident = await IncidentService.getIncidentById(id)

    res.status(200).json({
      status: 'success',
      data: incident,
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
        correlationId: (req as any).correlationId,
      })
    }

    console.error('Error fetching incident:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch incident',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * PUT /api/v1/incidents/:id
 * Update incident (title, description, severity)
 * Auth: Admin or assigned developer
 */
router.put('/:id', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, severity } = req.body
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' })
    }

    if (!id || !uuidv4.validate(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid incident ID',
      })
    }

    const incident = await IncidentService.updateIncident(
      id,
      { title, description, severity },
      userId
    )

    res.status(200).json({
      status: 'success',
      data: incident,
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
        correlationId: (req as any).correlationId,
      })
    }

    console.error('Error updating incident:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update incident',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * PUT /api/v1/incidents/:id/assign
 * Assign incident to a developer
 * Auth: Admin only
 */
router.put('/:id/assign', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { assignedTo } = req.body
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' })
    }

    if (!id || !uuidv4.validate(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid incident ID',
      })
    }

    if (!assignedTo) {
      return res.status(400).json({
        status: 'error',
        message: 'assignedTo is required',
      })
    }

    const incident = await IncidentService.assignIncident(id, { assignedTo }, userId)

    res.status(200).json({
      status: 'success',
      data: incident,
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
        correlationId: (req as any).correlationId,
      })
    }

    console.error('Error assigning incident:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to assign incident',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * PUT /api/v1/incidents/:id/status
 * Update incident status (with workflow validation)
 * Auth: Admin only
 */
router.put('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' })
    }

    if (!id || !uuidv4.validate(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid incident ID',
      })
    }

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'status is required',
      })
    }

    const incident = await IncidentService.updateStatus(id, status as IncidentStatus, userId)

    res.status(200).json({
      status: 'success',
      data: incident,
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: error.message,
        correlationId: (req as any).correlationId,
      })
    }

    if (error.message.includes('Invalid status transition')) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        correlationId: (req as any).correlationId,
      })
    }

    console.error('Error updating incident status:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update incident status',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * GET /api/v1/incidents/stats/overview
 * Get incident statistics
 * Auth: Developer+
 */
router.get('/stats/overview', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const stats = await IncidentService.getIncidentStats()
    const trends = await IncidentService.getIncidentTrends(7)

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        trends,
      },
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error fetching incident stats:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch incident stats',
      correlationId: (req as any).correlationId,
    })
  }
})

export default router
