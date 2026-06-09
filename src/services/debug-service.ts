// @ts-nocheck
/**
 * Debug Service
 * Handles debug session management
 */

import { v4 as uuidv4 } from 'uuid'
import { query } from './database.ts'
import { logger } from './logger.ts'
import type { DebugSession, CreateDebugSessionInput, DebugSessionResponse } from '../models/debug-session.ts'
import {
  formatDebugSessionResponse,
  getDebugSessionRemainingTime,
  isDebugSessionActive,
  isValidDebugDuration,
} from '../models/debug-session.ts'

export class DebugService {
  /**
   * Enable debug mode for a user
   */
  static async enableDebugSession(
    input: CreateDebugSessionInput,
    adminId: string
  ): Promise<DebugSessionResponse> {
    try {
      // Validate duration
      if (!isValidDebugDuration(input.duration)) {
        throw new Error('Invalid debug duration')
      }

      const id = uuidv4()
      const now = new Date()
      const expiresAt = new Date(now.getTime() + input.duration * 60 * 1000)

      await query(
        `INSERT INTO debug_sessions (
          id, user_id, enabled_by_admin_id, started_at, expires_at,
          reason, log_level, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          input.userId,
          adminId,
          now,
          expiresAt,
          input.reason || null,
          input.logLevel || 'DEBUG',
          now,
        ]
      )

      logger.info({
        type: 'debug_enabled',
        sessionId: id,
        userId: input.userId,
        adminId,
        durationMinutes: input.duration,
        reason: input.reason,
      })

      return {
        id,
        userId: input.userId,
        expiresAt,
        reason: input.reason,
        logLevel: input.logLevel || 'DEBUG',
        remainingMinutes: input.duration,
      }
    } catch (error) {
      logger.error({
        type: 'debug_enable_failed',
        userId: input.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Disable debug session
   */
  static async disableDebugSession(sessionId: string): Promise<void> {
    try {
      // Update expires_at to now (effectively disabling it)
      await query(
        'UPDATE debug_sessions SET expires_at = NOW() WHERE id = $1',
        [sessionId]
      )

      logger.info({
        type: 'debug_disabled',
        sessionId,
      })
    } catch (error) {
      logger.error({
        type: 'debug_disable_failed',
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get active debug session for a user
   */
  static async getActiveDebugSession(userId: string): Promise<DebugSessionResponse | null> {
    try {
      const result = await query(
        `SELECT
          id, user_id, enabled_by_admin_id, started_at, expires_at,
          reason, log_level, created_at
        FROM debug_sessions
        WHERE user_id = $1 AND expires_at > NOW()
        ORDER BY expires_at DESC
        LIMIT 1`,
        [userId]
      )

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]
      return formatDebugSessionResponse({
        id: row.id,
        userId: row.user_id,
        enabledByAdminId: row.enabled_by_admin_id,
        startedAt: row.started_at,
        expiresAt: row.expires_at,
        reason: row.reason,
        logLevel: row.log_level,
        createdAt: row.created_at,
      })
    } catch (error) {
      logger.error({
        type: 'debug_get_failed',
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get current log level for a user
   */
  static async getUserLogLevel(userId: string): Promise<string> {
    try {
      const session = await this.getActiveDebugSession(userId)

      if (session && isDebugSessionActive(session.expiresAt)) {
        return session.logLevel
      }

      return 'INFO' // Default log level
    } catch (error) {
      logger.error({
        type: 'debug_log_level_failed',
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return 'INFO'
    }
  }

  /**
   * List active debug sessions
   */
  static async getActiveSessions(): Promise<DebugSessionResponse[]> {
    try {
      const result = await query(
        `SELECT
          id, user_id, enabled_by_admin_id, started_at, expires_at,
          reason, log_level, created_at
        FROM debug_sessions
        WHERE expires_at > NOW()
        ORDER BY expires_at ASC`
      )

      return result.rows.map((row: any) =>
        formatDebugSessionResponse({
          id: row.id,
          userId: row.user_id,
          enabledByAdminId: row.enabled_by_admin_id,
          startedAt: row.started_at,
          expiresAt: row.expires_at,
          reason: row.reason,
          logLevel: row.log_level,
          createdAt: row.created_at,
        })
      )
    } catch (error) {
      logger.error({
        type: 'debug_list_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Clean up expired debug sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await query(
        'DELETE FROM debug_sessions WHERE expires_at < NOW()'
      )

      const deletedCount = result.rowCount || 0

      logger.info({
        type: 'debug_cleanup',
        sessionsDeleted: deletedCount,
      })

      return deletedCount
    } catch (error) {
      logger.error({
        type: 'debug_cleanup_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get debug session statistics
   */
  static async getDebugStats(): Promise<any> {
    try {
      // Total sessions
      const totalResult = await query('SELECT COUNT(*) as count FROM debug_sessions')
      const totalSessions = parseInt(totalResult.rows[0].count, 10)

      // Active sessions
      const activeResult = await query(
        'SELECT COUNT(*) as count FROM debug_sessions WHERE expires_at > NOW()'
      )
      const activeSessions = parseInt(activeResult.rows[0].count, 10)

      // Total unique users
      const usersResult = await query('SELECT COUNT(DISTINCT user_id) as count FROM debug_sessions')
      const totalUsers = parseInt(usersResult.rows[0].count, 10)

      // Average duration
      const durationResult = await query(
        `SELECT AVG(EXTRACT(EPOCH FROM (expires_at - started_at)) / 60) as avg_duration
        FROM debug_sessions`
      )
      const avgDuration = parseFloat(durationResult.rows[0].avg_duration || '0')

      // Common reasons
      const reasonsResult = await query(
        `SELECT reason, COUNT(*) as count
        FROM debug_sessions
        WHERE reason IS NOT NULL
        GROUP BY reason
        ORDER BY count DESC
        LIMIT 10`
      )
      const commonReasons: Record<string, number> = {}
      reasonsResult.rows.forEach((row: any) => {
        commonReasons[row.reason] = parseInt(row.count, 10)
      })

      return {
        totalSessions,
        activeSessions,
        totalUsers,
        averageDurationMinutes: Math.round(avgDuration),
        commonReasons,
      }
    } catch (error) {
      logger.error({
        type: 'debug_stats_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
