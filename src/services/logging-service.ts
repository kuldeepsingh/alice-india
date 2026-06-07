/**
 * Logging Service
 * Handles storage and retrieval of structured logs
 */

import { v4 as uuidv4 } from 'uuid'
import { query } from './database.ts'
import { logger } from './logger.ts'
import type { Log, CreateLogInput, LogFilter, LogQueryResult } from '../models/log.ts'

export class LoggingService {
  /**
   * Store a log entry
   */
  static async storeLog(input: CreateLogInput): Promise<Log> {
    try {
      const id = uuidv4()
      const createdAt = new Date()

      await query(
        `INSERT INTO logs (
          id, timestamp, level, message, user_id, correlation_id,
          module, context, stack_trace, request_id, session_id,
          ip_address, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          id,
          input.timestamp || new Date(),
          input.level,
          input.message,
          input.userId || null,
          input.correlationId || null,
          input.module || null,
          input.context ? JSON.stringify(input.context) : null,
          input.stackTrace || null,
          input.requestId || null,
          input.sessionId || null,
          input.ipAddress || null,
          createdAt,
        ]
      )

      return {
        id,
        timestamp: input.timestamp || new Date(),
        level: input.level,
        message: input.message,
        userId: input.userId,
        correlationId: input.correlationId,
        module: input.module,
        context: input.context,
        stackTrace: input.stackTrace,
        requestId: input.requestId,
        sessionId: input.sessionId,
        ipAddress: input.ipAddress,
        createdAt,
      }
    } catch (error) {
      logger.error({
        type: 'log_store_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Retrieve logs with filtering
   */
  static async getLogs(filter: LogFilter): Promise<LogQueryResult> {
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

      if (filter.level) {
        whereClause += ` AND level = $${paramCount}`
        params.push(filter.level)
        paramCount++
      }

      if (filter.module) {
        whereClause += ` AND module = $${paramCount}`
        params.push(filter.module)
        paramCount++
      }

      if (filter.correlationId) {
        whereClause += ` AND correlation_id = $${paramCount}`
        params.push(filter.correlationId)
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

      if (filter.search) {
        whereClause += ` AND message ILIKE $${paramCount}`
        params.push(`%${filter.search}%`)
        paramCount++
      }

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM logs WHERE ${whereClause}`,
        params
      )
      const total = parseInt(countResult.rows[0].total, 10)

      // Get paginated results
      const dataQuery = `
        SELECT
          id, timestamp, level, message, user_id, correlation_id,
          module, context, stack_trace, request_id, session_id,
          ip_address, created_at
        FROM logs
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `

      const dataResult = await query(dataQuery, [...params, limit, offset])

      const data: Log[] = dataResult.rows.map((row: any) => ({
        id: row.id,
        timestamp: row.timestamp,
        level: row.level,
        message: row.message,
        userId: row.user_id,
        correlationId: row.correlation_id,
        module: row.module,
        context: row.context,
        stackTrace: row.stack_trace,
        requestId: row.request_id,
        sessionId: row.session_id,
        ipAddress: row.ip_address,
        createdAt: row.created_at,
      }))

      return {
        data,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
      }
    } catch (error) {
      logger.error({
        type: 'log_retrieval_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get logs for a specific correlation ID (trace request across services)
   */
  static async getLogsByCorrelationId(correlationId: string): Promise<Log[]> {
    try {
      const result = await query(
        `SELECT
          id, timestamp, level, message, user_id, correlation_id,
          module, context, stack_trace, request_id, session_id,
          ip_address, created_at
        FROM logs
        WHERE correlation_id = $1
        ORDER BY timestamp ASC`,
        [correlationId]
      )

      return result.rows.map((row: any) => ({
        id: row.id,
        timestamp: row.timestamp,
        level: row.level,
        message: row.message,
        userId: row.user_id,
        correlationId: row.correlation_id,
        module: row.module,
        context: row.context,
        stackTrace: row.stack_trace,
        requestId: row.request_id,
        sessionId: row.session_id,
        ipAddress: row.ip_address,
        createdAt: row.created_at,
      }))
    } catch (error) {
      logger.error({
        type: 'log_correlation_failed',
        correlationId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Delete old logs (for maintenance)
   */
  static async deleteOldLogs(daysOld: number): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await query(
        'DELETE FROM logs WHERE created_at < $1',
        [cutoffDate]
      )

      const deletedCount = result.rowCount || 0

      logger.info({
        type: 'logs_deleted',
        count: deletedCount,
        daysOld,
      })

      return deletedCount
    } catch (error) {
      logger.error({
        type: 'log_deletion_failed',
        daysOld,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
