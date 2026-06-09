// @ts-nocheck
/**
 * Error Service
 * Handles error tracking, grouping, and management
 */

import { v4 as uuidv4 } from 'uuid'
import { query } from './database.ts'
import { logger } from './logger.ts'
import type { Error as ErrorModel, CreateErrorInput, ErrorFilter, ErrorQueryResult, ErrorWithUser } from '../models/error.ts'
import { createErrorSignature, determineErrorSeverity } from '../models/error.ts'

export class ErrorService {
  /**
   * Track an error occurrence
   */
  static async trackError(input: CreateErrorInput, userId?: string, ipAddress?: string): Promise<ErrorModel> {
    try {
      const errorHash = createErrorSignature(input.message, input.stackTrace)

      // Check if error already exists
      const existingResult = await query(
        'SELECT id FROM errors WHERE error_hash = $1 LIMIT 1',
        [errorHash]
      )

      if (existingResult.rows.length > 0) {
        // Update existing error
        return this.updateErrorOccurrence(
          existingResult.rows[0].id,
          userId
        )
      }

      // Create new error
      const id = uuidv4()
      const now = new Date()

      await query(
        `INSERT INTO errors (
          id, error_hash, title, message, stack_trace,
          first_occurrence, last_occurrence, occurrence_count,
          affected_users, status, context, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          id,
          errorHash,
          input.title,
          input.message,
          input.stackTrace,
          now,
          now,
          1,
          1,
          'new',
          input.context ? JSON.stringify(input.context) : null,
          now,
          now,
        ]
      )

      logger.info({
        type: 'error_tracked',
        errorId: id,
        errorHash,
        title: input.title,
      })

      return {
        id,
        errorHash,
        title: input.title,
        message: input.message,
        stackTrace: input.stackTrace,
        firstOccurrence: now,
        lastOccurrence: now,
        occurrenceCount: 1,
        affectedUsers: 1,
        status: 'new',
        context: input.context,
        createdAt: now,
        updatedAt: now,
      }
    } catch (error) {
      logger.error({
        type: 'error_track_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Update error occurrence
   */
  private static async updateErrorOccurrence(errorId: string, userId?: string): Promise<ErrorModel> {
    try {
      const now = new Date()

      // Get current error to check affected users
      const currentResult = await query(
        'SELECT affected_users FROM errors WHERE id = $1',
        [errorId]
      )

      const currentAffectedUsers = currentResult.rows[0].affected_users

      // Check if this is a new user
      const userCheckResult = await query(
        `SELECT COUNT(DISTINCT user_id) as user_count FROM logs
         WHERE id IN (
           SELECT DISTINCT request_id FROM logs WHERE id = $1
         )`,
        [errorId]
      )

      const isNewUser = userId ? userCheckResult.rows[0].user_count === 0 : false
      const newAffectedUsers = isNewUser ? currentAffectedUsers + 1 : currentAffectedUsers

      await query(
        `UPDATE errors SET
          occurrence_count = occurrence_count + 1,
          last_occurrence = $2,
          affected_users = $3,
          updated_at = $2
        WHERE id = $1`,
        [errorId, now, newAffectedUsers]
      )

      // Fetch updated error
      return this.getErrorById(errorId)
    } catch (error) {
      logger.error({
        type: 'error_update_failed',
        errorId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get error by ID with user information
   */
  static async getErrorById(errorId: string): Promise<ErrorModel> {
    try {
      const result = await query(
        `SELECT
          e.id, e.error_hash, e.title, e.message, e.stack_trace,
          e.first_occurrence, e.last_occurrence, e.occurrence_count,
          e.affected_users, e.status, e.assigned_to, e.context,
          e.created_at, e.updated_at
        FROM errors e
        WHERE e.id = $1`,
        [errorId]
      )

      if (result.rows.length === 0) {
        throw new Error(`Error not found: ${errorId}`)
      }

      const row = result.rows[0]
      return {
        id: row.id,
        errorHash: row.error_hash,
        title: row.title,
        message: row.message,
        stackTrace: row.stack_trace,
        firstOccurrence: row.first_occurrence,
        lastOccurrence: row.last_occurrence,
        occurrenceCount: row.occurrence_count,
        affectedUsers: row.affected_users,
        status: row.status,
        assignedTo: row.assigned_to,
        context: row.context,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    } catch (error) {
      logger.error({
        type: 'error_retrieval_failed',
        errorId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get errors with filtering and pagination
   */
  static async getErrors(filter: ErrorFilter): Promise<ErrorQueryResult> {
    try {
      const limit = filter.limit || 50
      const offset = filter.offset || 0

      let whereClause = '1=1'
      const params: any[] = []
      let paramCount = 1

      if (filter.status) {
        whereClause += ` AND e.status = $${paramCount}`
        params.push(filter.status)
        paramCount++
      }

      if (filter.assignedTo) {
        whereClause += ` AND e.assigned_to = $${paramCount}`
        params.push(filter.assignedTo)
        paramCount++
      }

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM errors e WHERE ${whereClause}`,
        params
      )
      const total = parseInt(countResult.rows[0].total, 10)

      // Determine sort field
      let sortField = 'e.last_occurrence'
      if (filter.sortBy === 'occurrence') {
        sortField = 'e.occurrence_count'
      } else if (filter.sortBy === 'affectedUsers') {
        sortField = 'e.affected_users'
      }

      // Get paginated results with user info
      const dataQuery = `
        SELECT
          e.id, e.error_hash, e.title, e.message, e.stack_trace,
          e.first_occurrence, e.last_occurrence, e.occurrence_count,
          e.affected_users, e.status, e.assigned_to, e.context,
          e.created_at, e.updated_at,
          u.id as assigned_user_id, u.email, u.role
        FROM errors e
        LEFT JOIN users u ON e.assigned_to = u.id
        WHERE ${whereClause}
        ORDER BY ${sortField} DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `

      const dataResult = await query(dataQuery, [...params, limit, offset])

      const data: ErrorWithUser[] = dataResult.rows.map((row: any) => ({
        id: row.id,
        errorHash: row.error_hash,
        title: row.title,
        message: row.message,
        stackTrace: row.stack_trace,
        firstOccurrence: row.first_occurrence,
        lastOccurrence: row.last_occurrence,
        occurrenceCount: row.occurrence_count,
        affectedUsers: row.affected_users,
        status: row.status,
        assignedTo: row.assigned_to,
        context: row.context,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        assignedToUser: row.assigned_user_id
          ? {
              id: row.assigned_user_id,
              email: row.email,
              role: row.role,
            }
          : undefined,
      }))

      // Get error rate (errors in last 24 hours)
      const rateResult = await query(
        `SELECT COUNT(*) as error_count FROM errors
         WHERE last_occurrence > NOW() - INTERVAL '24 hours'`
      )
      const errorRate = parseInt(rateResult.rows[0].error_count, 10) / 24 // Errors per hour

      // Get top errors
      const topErrorsResult = await query(
        `SELECT
          e.id, e.error_hash, e.title, e.message, e.stack_trace,
          e.first_occurrence, e.last_occurrence, e.occurrence_count,
          e.affected_users, e.status, e.assigned_to, e.context,
          e.created_at, e.updated_at
        FROM errors e
        ORDER BY e.occurrence_count DESC
        LIMIT 5`
      )

      const topErrors = topErrorsResult.rows.map((row: any) => ({
        id: row.id,
        errorHash: row.error_hash,
        title: row.title,
        message: row.message,
        stackTrace: row.stack_trace,
        firstOccurrence: row.first_occurrence,
        lastOccurrence: row.last_occurrence,
        occurrenceCount: row.occurrence_count,
        affectedUsers: row.affected_users,
        status: row.status,
        assignedTo: row.assigned_to,
        context: row.context,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))

      return {
        data,
        total,
        errorRate: Math.round(errorRate * 100) / 100,
        topErrors,
      }
    } catch (error) {
      logger.error({
        type: 'error_query_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Update error status and assignment
   */
  static async updateError(
    errorId: string,
    updates: { status?: string; assignedTo?: string }
  ): Promise<ErrorModel> {
    try {
      const updateFields: string[] = []
      const params: any[] = []
      let paramCount = 1

      if (updates.status) {
        updateFields.push(`status = $${paramCount}`)
        params.push(updates.status)
        paramCount++
      }

      if (updates.assignedTo !== undefined) {
        updateFields.push(`assigned_to = $${paramCount}`)
        params.push(updates.assignedTo || null)
        paramCount++
      }

      if (updateFields.length === 0) {
        return this.getErrorById(errorId)
      }

      updateFields.push(`updated_at = $${paramCount}`)
      params.push(new Date())

      params.push(errorId)

      await query(
        `UPDATE errors SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1}`,
        params
      )

      return this.getErrorById(errorId)
    } catch (error) {
      logger.error({
        type: 'error_update_failed',
        errorId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
