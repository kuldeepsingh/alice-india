/**
 * On-Call Service
 * Manages on-call schedule and team availability
 */

import { v4 as uuidv4 } from 'uuid'
import { query } from './database.ts'

export interface OnCallSchedule {
  id: string
  user_id: string
  start_date: string
  end_date: string
  shift_type: 'daytime' | 'night' | 'weekend' | 'full-week'
  primary_oncall: boolean
  backup_oncall: boolean
  notes?: string
  created_at: Date
  updated_at: Date
}

export class OnCallService {
  /**
   * Create on-call schedule
   */
  static async createSchedule(
    userId: string,
    startDate: Date,
    endDate: Date,
    shiftType: string,
    notes?: string
  ): Promise<OnCallSchedule> {
    const id = uuidv4()
    const now = new Date()

    const sql = `
      INSERT INTO on_call_schedule (
        id, user_id, start_date, end_date, shift_type,
        primary_oncall, notes, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8)
      RETURNING *
    `

    const values = [
      id,
      userId,
      startDate,
      endDate,
      shiftType,
      notes || null,
      now,
      now,
    ]

    const result = await query(sql, values)
    return result.rows[0]
  }

  /**
   * Get schedule for user in date range
   */
  static async getSchedule(userId: string, startDate: Date, endDate: Date): Promise<OnCallSchedule[]> {
    const sql = `
      SELECT * FROM on_call_schedule
      WHERE user_id = $1
        AND start_date <= $3
        AND end_date >= $2
      ORDER BY start_date ASC
    `

    const result = await query(sql, [userId, startDate, endDate])
    return result.rows
  }

  /**
   * Get current on-call person (primary and backup)
   */
  static async getActiveOnCall(date: Date): Promise<{
    primary?: any
    backup?: any
  }> {
    const sql = `
      SELECT
        o.*,
        json_build_object(
          'id', u.id,
          'email', u.email,
          'role', u.role
        ) as user_info
      FROM on_call_schedule o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE $1 >= o.start_date AND $1 <= o.end_date
      ORDER BY o.primary_oncall DESC, o.created_at ASC
      LIMIT 2
    `

    const result = await query(sql, [date])
    return {
      primary: result.rows[0] || null,
      backup: result.rows[1] || null,
    }
  }

  /**
   * Get team schedule for date range
   */
  static async getTeamSchedule(startDate: Date, endDate: Date): Promise<any[]> {
    const sql = `
      SELECT
        o.*,
        json_build_object(
          'id', u.id,
          'email', u.email,
          'role', u.role
        ) as user_info
      FROM on_call_schedule o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE start_date <= $2 AND end_date >= $1
      ORDER BY start_date ASC, primary_oncall DESC
    `

    const result = await query(sql, [startDate, endDate])
    return result.rows
  }

  /**
   * Update schedule
   */
  static async updateSchedule(
    id: string,
    updates: Partial<OnCallSchedule>
  ): Promise<OnCallSchedule> {
    const setClause: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.shift_type) {
      setClause.push(`shift_type = $${paramCount++}`)
      values.push(updates.shift_type)
    }

    if (updates.notes !== undefined) {
      setClause.push(`notes = $${paramCount++}`)
      values.push(updates.notes)
    }

    if (updates.primary_oncall !== undefined) {
      setClause.push(`primary_oncall = $${paramCount++}`)
      values.push(updates.primary_oncall)
    }

    setClause.push(`updated_at = $${paramCount++}`)
    values.push(new Date())

    const sql = `UPDATE on_call_schedule SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`
    values.push(id)

    const result = await query(sql, values)
    return result.rows[0]
  }

  /**
   * Check for conflicts
   */
  static async validateNoConflicts(userId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count FROM on_call_schedule
      WHERE user_id = $1
        AND primary_oncall = true
        AND start_date <= $3
        AND end_date >= $2
    `

    const result = await query(sql, [userId, startDate, endDate])
    return parseInt(result.rows[0].count) === 0
  }

  /**
   * Get team metrics
   */
  static async getTeamMetrics(): Promise<any> {
    const sql = `
      SELECT
        COUNT(DISTINCT user_id) as users_on_call,
        COUNT(*) as total_schedules,
        SUM(CASE WHEN primary_oncall = true THEN 1 ELSE 0 END) as primary_count,
        SUM(CASE WHEN primary_oncall = false THEN 1 ELSE 0 END) as backup_count
      FROM on_call_schedule
      WHERE end_date >= CURRENT_DATE
    `

    const result = await query(sql)
    return result.rows[0]
  }
}
