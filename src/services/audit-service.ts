/**
 * Audit Service
 * Handles immutable audit trail recording and retrieval
 */

import { v4 as uuidv4 } from 'uuid'
import { query } from './database.ts'
import { logger } from './logger.ts'
import type { AuditLog, CreateAuditLogInput, AuditFilter, AuditQueryResult } from '../models/audit.ts'
import { formatAuditForCSV, formatAuditForJSON } from '../models/audit.ts'

export class AuditService {
  /**
   * Create an audit log entry
   */
  static async createAuditLog(input: CreateAuditLogInput): Promise<AuditLog> {
    try {
      const id = uuidv4()
      const createdAt = new Date()

      await query(
        `INSERT INTO audit_logs (
          id, user_id, action, resource_type, resource_id,
          old_value, new_value, ip_address, user_agent,
          status, created_at, immutable
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          id,
          input.userId,
          input.action,
          input.resourceType || null,
          input.resourceId || null,
          input.oldValue ? JSON.stringify(input.oldValue) : null,
          input.newValue ? JSON.stringify(input.newValue) : null,
          input.ipAddress || null,
          input.userAgent || null,
          input.status,
          createdAt,
          true, // All logs are immutable
        ]
      )

      logger.info({
        type: 'audit_log_created',
        auditId: id,
        userId: input.userId,
        action: input.action,
      })

      return {
        id,
        userId: input.userId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        oldValue: input.oldValue,
        newValue: input.newValue,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        status: input.status,
        createdAt,
        immutable: true,
      }
    } catch (error) {
      logger.error({
        type: 'audit_log_failed',
        userId: input.userId,
        action: input.action,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Retrieve audit logs with filtering
   */
  static async getAuditLogs(filter: AuditFilter): Promise<AuditQueryResult> {
    try {
      const limit = filter.limit || 50
      const offset = filter.offset || 0

      let whereClause = '1=1'
      const params: any[] = []
      let paramCount = 1

      if (filter.userId) {
        whereClause += ` AND user_id = $${paramCount}`
        params.push(filter.userId)
        paramCount++
      }

      if (filter.action) {
        whereClause += ` AND action = $${paramCount}`
        params.push(filter.action)
        paramCount++
      }

      if (filter.resourceType) {
        whereClause += ` AND resource_type = $${paramCount}`
        params.push(filter.resourceType)
        paramCount++
      }

      if (filter.status) {
        whereClause += ` AND status = $${paramCount}`
        params.push(filter.status)
        paramCount++
      }

      if (filter.startDate) {
        whereClause += ` AND created_at >= $${paramCount}`
        params.push(filter.startDate)
        paramCount++
      }

      if (filter.endDate) {
        whereClause += ` AND created_at <= $${paramCount}`
        params.push(filter.endDate)
        paramCount++
      }

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM audit_logs WHERE ${whereClause}`,
        params
      )
      const total = parseInt(countResult.rows[0].total, 10)

      // Get paginated results
      const dataQuery = `
        SELECT
          id, user_id, action, resource_type, resource_id,
          old_value, new_value, ip_address, user_agent,
          status, created_at, immutable
        FROM audit_logs
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `

      const dataResult = await query(dataQuery, [...params, limit, offset])

      const data: AuditLog[] = dataResult.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        oldValue: row.old_value ? JSON.parse(row.old_value) : undefined,
        newValue: row.new_value ? JSON.parse(row.new_value) : undefined,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        status: row.status,
        createdAt: row.created_at,
        immutable: row.immutable,
      }))

      return {
        data,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
      }
    } catch (error) {
      logger.error({
        type: 'audit_retrieval_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get user activity summary
   */
  static async getUserActivity(userId: string): Promise<any> {
    try {
      const result = await query(
        `SELECT
          COUNT(*) as total_actions,
          action,
          MAX(created_at) as last_activity
        FROM audit_logs
        WHERE user_id = $1
        GROUP BY action
        ORDER BY COUNT(*) DESC`,
        [userId]
      )

      const actionTypes: Record<string, number> = {}
      let lastActivity = new Date(0)

      result.rows.forEach((row: any) => {
        actionTypes[row.action] = parseInt(row.total_actions, 10)
        if (new Date(row.last_activity) > lastActivity) {
          lastActivity = new Date(row.last_activity)
        }
      })

      // Get recent actions
      const recentResult = await query(
        `SELECT
          id, user_id, action, resource_type, resource_id,
          old_value, new_value, ip_address, user_agent,
          status, created_at, immutable
        FROM audit_logs
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10`,
        [userId]
      )

      const recentActions: AuditLog[] = recentResult.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        oldValue: row.old_value ? JSON.parse(row.old_value) : undefined,
        newValue: row.new_value ? JSON.parse(row.new_value) : undefined,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        status: row.status,
        createdAt: row.created_at,
        immutable: row.immutable,
      }))

      return {
        totalActions: result.rows.reduce((sum: number, row: any) => sum + parseInt(row.total_actions, 10), 0),
        actionTypes,
        lastActivity,
        recentActions,
      }
    } catch (error) {
      logger.error({
        type: 'audit_activity_failed',
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Export audit logs
   */
  static async exportAuditLogs(
    filter: AuditFilter,
    format: 'csv' | 'json'
  ): Promise<string> {
    try {
      const result = await this.getAuditLogs({ ...filter, limit: 10000 })

      if (format === 'csv') {
        return formatAuditForCSV(result.data)
      } else {
        return formatAuditForJSON(result.data)
      }
    } catch (error) {
      logger.error({
        type: 'audit_export_failed',
        format,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get audit statistics
   */
  static async getAuditStats(daysBack: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)

      // Total logs
      const countResult = await query(
        'SELECT COUNT(*) as total FROM audit_logs WHERE created_at >= $1',
        [startDate]
      )
      const total = parseInt(countResult.rows[0].total, 10)

      // By action
      const actionResult = await query(
        `SELECT action, COUNT(*) as count
        FROM audit_logs
        WHERE created_at >= $1
        GROUP BY action
        ORDER BY count DESC`,
        [startDate]
      )

      const byAction: Record<string, number> = {}
      actionResult.rows.forEach((row: any) => {
        byAction[row.action] = parseInt(row.count, 10)
      })

      // Failed actions
      const failedResult = await query(
        'SELECT COUNT(*) as count FROM audit_logs WHERE created_at >= $1 AND status = $2',
        [startDate, 'failure']
      )
      const failedCount = parseInt(failedResult.rows[0].count, 10)

      return {
        period: `Last ${daysBack} days`,
        total,
        failed: failedCount,
        successRate: total > 0 ? ((total - failedCount) / total * 100).toFixed(2) : 0,
        byAction,
      }
    } catch (error) {
      logger.error({
        type: 'audit_stats_failed',
        daysBack,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
