// @ts-nocheck
/**
 * Incident Service
 * Manages incident creation, assignment, and lifecycle
 */

import { v4 as uuidv4 } from 'uuid'
import { query } from './database.ts'
import {
  Incident,
  IncidentWithUser,
  CreateIncidentInput,
  UpdateIncidentInput,
  AssignIncidentInput,
  IncidentFilter,
  IncidentQueryResult,
  IncidentStatus,
  getValidNextStatuses,
} from '../models/incident.ts'
import { AuditService } from './audit-service.ts'

export class IncidentService {
  /**
   * Create a new incident
   */
  static async createIncident(input: CreateIncidentInput, createdBy: string): Promise<Incident> {
    const id = uuidv4()
    const now = new Date()

    const sql = `
      INSERT INTO incidents (
        id, title, description, severity,
        created_by, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const values = [
      id,
      input.title,
      input.description || null,
      input.severity,
      createdBy,
      'open',
      now,
      now,
    ]

    const result = await query(sql, values)
    const incident = result.rows[0]

    // Log to audit trail
    await AuditService.createAuditLog({
      userId: createdBy,
      action: 'incident_created',
      resourceType: 'incident',
      resourceId: id,
      newValue: incident,
      status: 'success',
    })

    return incident
  }

  /**
   * Get incidents with filtering and pagination
   */
  static async getIncidents(filter: IncidentFilter): Promise<IncidentQueryResult> {
    let sql = `
      SELECT
        i.*,
        json_build_object(
          'id', ub.id,
          'email', ub.email,
          'role', ub.role
        ) as created_by_user,
        json_build_object(
          'id', ua.id,
          'email', ua.email,
          'role', ua.role
        ) as assigned_to_user
      FROM incidents i
      LEFT JOIN users ub ON i.created_by = ub.id
      LEFT JOIN users ua ON i.assigned_to = ua.id
      WHERE 1=1
    `

    const values: any[] = []
    let paramCount = 1

    // Apply filters
    if (filter.status) {
      sql += ` AND i.status = $${paramCount++}`
      values.push(filter.status)
    }

    if (filter.severity) {
      sql += ` AND i.severity = $${paramCount++}`
      values.push(filter.severity)
    }

    if (filter.assignedTo) {
      sql += ` AND i.assigned_to = $${paramCount++}`
      values.push(filter.assignedTo)
    }

    if (filter.createdBy) {
      sql += ` AND i.created_by = $${paramCount++}`
      values.push(filter.createdBy)
    }

    // Count total
    const countSql = `SELECT COUNT(*) as count FROM incidents i WHERE 1=1` +
      (filter.status ? ` AND i.status = $1` : '') +
      (filter.severity ? ` AND i.severity = ${filter.status ? '$2' : '$1'}` : '') +
      (filter.assignedTo ? ` AND i.assigned_to = ${filter.severity ? '$3' : filter.status ? '$2' : '$1'}` : '')

    const countResult = await query(countSql, values.slice(0, paramCount - 1))
    const total = parseInt(countResult.rows[0].count)

    // Pagination
    const limit = filter.limit || 50
    const offset = filter.offset || 0
    sql += ` ORDER BY i.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
    values.push(limit, offset)

    const result = await query(sql, values)

    return {
      data: result.rows,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    }
  }

  /**
   * Get incident by ID with user details
   */
  static async getIncidentById(id: string): Promise<IncidentWithUser> {
    const sql = `
      SELECT
        i.*,
        json_build_object(
          'id', ub.id,
          'email', ub.email,
          'role', ub.role
        ) as created_by_user,
        json_build_object(
          'id', ua.id,
          'email', ua.email,
          'role', ua.role
        ) as assigned_to_user
      FROM incidents i
      LEFT JOIN users ub ON i.created_by = ub.id
      LEFT JOIN users ua ON i.assigned_to = ua.id
      WHERE i.id = $1
    `

    const result = await query(sql, [id])

    if (result.rows.length === 0) {
      throw new Error(`Incident not found: ${id}`)
    }

    return result.rows[0]
  }

  /**
   * Update incident details (title, description, severity)
   */
  static async updateIncident(id: string, updates: UpdateIncidentInput, updatedBy: string): Promise<Incident> {
    const current = await this.getIncidentById(id)

    // Build update query
    const setClause: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.title !== undefined) {
      setClause.push(`title = $${paramCount++}`)
      values.push(updates.title)
    }

    if (updates.description !== undefined) {
      setClause.push(`description = $${paramCount++}`)
      values.push(updates.description)
    }

    if (updates.severity !== undefined) {
      setClause.push(`severity = $${paramCount++}`)
      values.push(updates.severity)
    }

    if (setClause.length === 0) {
      return current
    }

    setClause.push(`updated_at = $${paramCount++}`)
    values.push(new Date())

    const sql = `UPDATE incidents SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`
    values.push(id)

    const result = await query(sql, values)
    const incident = result.rows[0]

    // Log to audit trail
    await AuditService.createAuditLog({
      userId: updatedBy,
      action: 'incident_updated',
      resourceType: 'incident',
      resourceId: id,
      oldValue: current,
      newValue: incident,
      status: 'success',
    })

    return incident
  }

  /**
   * Assign incident to a developer
   */
  static async assignIncident(
    id: string,
    input: AssignIncidentInput,
    assignedBy: string
  ): Promise<Incident> {
    const current = await this.getIncidentById(id)

    // Verify user exists
    const userResult = await query('SELECT id FROM users WHERE id = $1', [input.assignedTo])
    if (userResult.rows.length === 0) {
      throw new Error(`User not found: ${input.assignedTo}`)
    }

    const sql = `
      UPDATE incidents
      SET assigned_to = $1, updated_at = $2
      WHERE id = $3
      RETURNING *
    `

    const result = await query(sql, [input.assignedTo, new Date(), id])
    const incident = result.rows[0]

    // Log to audit trail
    await AuditService.createAuditLog({
      userId: assignedBy,
      action: 'incident_assigned',
      resourceType: 'incident',
      resourceId: id,
      oldValue: { assigned_to: current.assigned_to },
      newValue: { assigned_to: incident.assigned_to },
      status: 'success',
    })

    return incident
  }

  /**
   * Update incident status (with workflow validation)
   */
  static async updateStatus(id: string, status: IncidentStatus, updatedBy: string): Promise<Incident> {
    const current = await this.getIncidentById(id)

    // Validate status transition
    const validNextStatuses = getValidNextStatuses(current.status)
    if (!validNextStatuses.includes(status)) {
      throw new Error(
        `Invalid status transition: ${current.status} → ${status}. Valid next statuses: ${validNextStatuses.join(', ')}`
      )
    }

    const resolvedAt = status === 'resolved' ? new Date() : null

    const sql = `
      UPDATE incidents
      SET status = $1, resolved_at = $2, updated_at = $3
      WHERE id = $4
      RETURNING *
    `

    const result = await query(sql, [status, resolvedAt, new Date(), id])
    const incident = result.rows[0]

    // Log to audit trail
    await AuditService.createAuditLog({
      userId: updatedBy,
      action: 'incident_status_changed',
      resourceType: 'incident',
      resourceId: id,
      oldValue: { status: current.status },
      newValue: { status: incident.status },
      status: 'success',
    })

    return incident
  }

  /**
   * Close incident with resolution notes
   */
  static async closeIncident(id: string, notes: string, closedBy: string): Promise<void> {
    const current = await this.getIncidentById(id)

    const sql = `
      UPDATE incidents
      SET status = 'closed', resolution_notes = $1, resolved_at = $2, updated_at = $3
      WHERE id = $4
    `

    await query(sql, [notes, new Date(), new Date(), id])

    // Log to audit trail
    await AuditService.createAuditLog({
      userId: closedBy,
      action: 'incident_closed',
      resourceType: 'incident',
      resourceId: id,
      oldValue: { status: current.status, resolution_notes: current.resolution_notes },
      newValue: { status: 'closed', resolution_notes: notes },
      status: 'success',
    })
  }

  /**
   * Get incident statistics
   */
  static async getIncidentStats() {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'open') as open_count,
        COUNT(*) FILTER (WHERE status = 'investigating') as investigating_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) as total_count,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_time_seconds,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
        COUNT(*) FILTER (WHERE severity = 'high') as high_count
      FROM incidents
    `

    const result = await query(sql)
    return result.rows[0]
  }

  /**
   * Get incident trends (last N days)
   */
  static async getIncidentTrends(days: number = 7) {
    const sql = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as incidents_created,
        COUNT(*) FILTER (WHERE status = 'resolved') as incidents_resolved,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_incidents,
        COUNT(*) FILTER (WHERE severity = 'high') as high_incidents
      FROM incidents
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    const result = await query(sql)
    return result.rows
  }
}
