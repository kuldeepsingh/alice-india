/**
 * Team API Routes
 * GET, POST endpoints for team coordination and on-call management
 */

import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { OnCallService } from '../services/on-call-service.ts'
import { IncidentService } from '../services/incident-service.ts'
import { authMiddleware, AuthRequest } from '../middleware/auth.ts'
import { requireDeveloper, requireAdmin } from '../middleware/rbac.ts'
import { query } from '../services/database.ts'
import { logger } from '../services/logger.ts'

const router = Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

/**
 * GET /api/v1/team/members
 * Get all team members
 * Auth: Developer+
 */
router.get('/members', requireAdmin(), async (req: AuthRequest, res: Response) => {
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
 * GET /api/v1/team/search
 * Search team members by name, email, or role
 * Auth: Developer+
 * Query params: q (search term), role (filter by role)
 */
router.get('/search', requireDeveloper(), async (req: AuthRequest, res: Response) => {
  const requestId = `team-search-${Date.now()}`
  const startTime = Date.now()

  try {
    const { q, role } = req.query
    const userId = req.user?.userId
    const ipAddress = req.ip

    // LOG: Entry point
    logger.debug('Team', 'Team member search request received', {
      requestId,
      userId,
      searchTerm: q,
      roleFilter: role,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    // Input validation
    logger.debug('Team', 'Validating search parameters', {
      requestId,
      userId,
      hasSearchTerm: !!q,
      hasRoleFilter: !!role,
      searchTermLength: (q as string)?.length || 0,
    })

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      const duration = Date.now() - startTime
      logger.warn('Team', 'Team search validation failed - empty search term', {
        requestId,
        userId,
        durationMs: duration,
      })
      return res.status(400).json({
        status: 'error',
        message: 'Search term is required',
        reason: 'missing_search_term',
      })
    }

    const searchTerm = `%${(q as string).toLowerCase()}%`
    let sql = `
      SELECT
        id,
        email,
        role,
        created_at
      FROM users
      WHERE (LOWER(email) LIKE $1 OR LOWER(email) LIKE $1)
    `

    const params: any[] = [searchTerm]

    if (role && ['admin', 'trader', 'analyst', 'viewer'].includes(role as string)) {
      logger.debug('Team', 'Adding role filter to search', {
        requestId,
        userId,
        roleFilter: role,
      })
      sql += ' AND role = $2'
      params.push(role)
    } else if (role) {
      const duration = Date.now() - startTime
      logger.warn('Team', 'Team search validation failed - invalid role', {
        requestId,
        userId,
        providedRole: role,
        allowedRoles: ['admin', 'trader', 'analyst', 'viewer'],
        durationMs: duration,
      })
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role filter',
        reason: 'invalid_role',
      })
    }

    sql += ' ORDER BY email ASC LIMIT 100'

    // LOG: Executing search query
    logger.debug('Team', 'Executing team member search query', {
      requestId,
      userId,
      searchTerm: q,
      roleFilter: role || 'none',
      sqlParams: params.length,
    })

    const queryStart = Date.now()
    const result = await query(sql, params)
    const queryDuration = Date.now() - queryStart

    const totalDuration = Date.now() - startTime

    // LOG: Success
    logger.info('Team', 'Team member search completed successfully', {
      requestId,
      userId,
      searchTerm: q,
      roleFilter: role || 'none',
      resultsCount: result.rows.length,
      queryDurationMs: queryDuration,
      totalDurationMs: totalDuration,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    res.status(200).json({
      status: 'success',
      data: result.rows,
      count: result.rows.length,
      searchTerm: q,
      roleFilter: role || null,
      requestId,
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Team', `Team member search failed: ${errorMessage}`, error, {
      requestId,
      userId: req.user?.userId,
      searchTerm: req.query.q,
      roleFilter: req.query.role,
      errorMessage,
      durationMs: duration,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to search team members',
      reason: 'server_error',
      requestId,
    })
  }
})

/**
 * GET /api/v1/team/on-call
 * Get on-call schedule
 * Auth: Developer+
 * Query params: startDate, endDate
 */
router.get('/on-call', requireDeveloper(), async (req: AuthRequest, res: Response) => {
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
router.post('/on-call', requireAdmin(), async (req: AuthRequest, res: Response) => {
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
router.get('/metrics', requireDeveloper(), async (req: AuthRequest, res: Response) => {
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

/**
 * DELETE /api/v1/team/members/:id
 * Delete a user by ID
 * Auth: Admin only
 */
router.delete('/members/:id', requireAdmin(), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required',
        correlationId: (req as any).correlationId,
      })
    }

    // Delete the user from database
    const deleteResult = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email',
      [id]
    )

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        correlationId: (req as any).correlationId,
      })
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: deleteResult.rows[0],
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete user',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * PUT /api/v1/team/members/:id/role
 * Update user role
 * Auth: Admin only
 */
router.put('/members/:id/role', requireAdmin(), async (req: AuthRequest, res: Response) => {
  const requestId = `role-change-${Date.now()}`
  const startTime = Date.now()

  try {
    const { id } = req.params
    const { role } = req.body
    const adminId = (req as any).user?.id
    const adminEmail = (req as any).user?.email

    logger.debug('TeamAPI', 'Role change request received', {
      requestId,
      targetUserId: id,
      newRole: role,
      adminId,
      adminEmail,
      correlationId: (req as any).correlationId,
    })

    // Validation: User ID
    if (!id) {
      logger.warn('TeamAPI', 'Role change validation failed - missing user ID', {
        requestId,
        adminId,
        correlationId: (req as any).correlationId,
      })
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required',
        correlationId: (req as any).correlationId,
      })
    }

    // Validation: Role parameter
    if (!role) {
      logger.warn('TeamAPI', 'Role change validation failed - missing role parameter', {
        requestId,
        targetUserId: id,
        adminId,
        correlationId: (req as any).correlationId,
      })
      return res.status(400).json({
        status: 'error',
        message: 'Role is required',
        correlationId: (req as any).correlationId,
      })
    }

    // Validation: Valid role
    const validRoles = ['trader', 'admin', 'analyst', 'viewer']
    if (!validRoles.includes(role)) {
      logger.warn('TeamAPI', 'Role change validation failed - invalid role value', {
        requestId,
        targetUserId: id,
        providedRole: role,
        validRoles,
        adminId,
        correlationId: (req as any).correlationId,
      })
      return res.status(400).json({
        status: 'error',
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        correlationId: (req as any).correlationId,
      })
    }

    logger.debug('TeamAPI', 'Role change validation passed', {
      requestId,
      targetUserId: id,
      newRole: role,
      adminId,
    })

    // Fetch current user info
    logger.debug('TeamAPI', 'Fetching current user info from database', {
      requestId,
      targetUserId: id,
    })
    const fetchStart = Date.now()
    const currentUserResult = await query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [id]
    )
    const fetchDuration = Date.now() - fetchStart
    logger.debug('TeamAPI', 'User info fetched', {
      requestId,
      durationMs: fetchDuration,
      userFound: currentUserResult.rows.length > 0,
    })

    if (currentUserResult.rows.length === 0) {
      logger.warn('TeamAPI', 'Role change failed - target user not found', {
        requestId,
        targetUserId: id,
        adminId,
        correlationId: (req as any).correlationId,
      })
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        correlationId: (req as any).correlationId,
      })
    }

    const previousRole = currentUserResult.rows[0].role
    const targetUserEmail = currentUserResult.rows[0].email

    // Check if role is already the same
    if (previousRole === role) {
      logger.debug('TeamAPI', 'No-op role change - user already has requested role', {
        requestId,
        targetUserId: id,
        currentRole: previousRole,
        requestedRole: role,
        adminId,
      })
    }

    // Update user role
    logger.debug('TeamAPI', 'Updating user role in database', {
      requestId,
      targetUserId: id,
      currentRole: previousRole,
      newRole: role,
      targetUserEmail,
      adminId,
    })

    const updateStart = Date.now()
    const result = await query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role, created_at, updated_at',
      [role, id]
    )
    const updateDuration = Date.now() - updateStart

    logger.debug('TeamAPI', 'Role update query completed', {
      requestId,
      durationMs: updateDuration,
      rowsAffected: result.rowCount,
    })

    if (result.rows.length === 0) {
      logger.error('TeamAPI', 'Role change failed - update returned no rows', new Error('Database update failed'), {
        requestId,
        targetUserId: id,
        adminId,
        durationMs: updateDuration,
        correlationId: (req as any).correlationId,
      })
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update user role',
        correlationId: (req as any).correlationId,
      })
    }

    // Log successful role change - this is a critical audit event
    const totalDuration = Date.now() - startTime
    const updatedUser = result.rows[0]
    logger.info('TeamAPI', 'User role updated successfully', {
      requestId,
      targetUserId: id,
      targetUserEmail,
      previousRole,
      newRole: role,
      changedByAdminId: adminId,
      changedByAdminEmail: adminEmail,
      fetchDurationMs: fetchDuration,
      updateDurationMs: updateDuration,
      totalDurationMs: totalDuration,
      timestamp: new Date().toISOString(),
      correlationId: (req as any).correlationId,
    })

    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: updatedUser,
      correlationId: (req as any).correlationId,
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    // This is an error log for a critical operation
    logger.error('TeamAPI', 'Role change operation failed with exception', error, {
      requestId,
      targetUserId: req.params.id,
      newRole: req.body.role,
      adminId: (req as any).user?.id,
      adminEmail: (req as any).user?.email,
      durationMs: duration,
      errorType: error?.constructor?.name,
      errorMessage,
      stack: errorStack,
      correlationId: (req as any).correlationId,
    })

    res.status(500).json({
      status: 'error',
      message: errorMessage || 'Failed to update user role',
      correlationId: (req as any).correlationId,
    })
  }
})

export default router
