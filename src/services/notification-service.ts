/**
 * Notification Service
 * Manages notifications for team coordination and alerts
 */

import { v4 as uuidv4 } from 'uuid'
import { query } from './database.ts'
import {
  Notification,
  NotificationWithDetails,
  CreateNotificationInput,
  NotificationFilter,
  NotificationQueryResult,
  NotificationType,
} from '../models/notification.ts'

export class NotificationService {
  /**
   * Send a notification to a user
   */
  static async sendNotification(input: CreateNotificationInput): Promise<Notification> {
    const id = uuidv4()
    const now = new Date()

    const sql = `
      INSERT INTO notifications (
        id, user_id, type, title, message,
        related_incident_id, related_error_id, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const values = [
      id,
      input.userId,
      input.type,
      input.title,
      input.message || null,
      input.relatedIncidentId || null,
      input.relatedErrorId || null,
      now,
    ]

    const result = await query(sql, values)
    return result.rows[0]
  }

  /**
   * Broadcast notification to multiple users
   */
  static async broadcastToTeam(
    message: string,
    type: NotificationType,
    userIds: string[]
  ): Promise<Notification[]> {
    const notifications: Notification[] = []

    for (const userId of userIds) {
      const notif = await this.sendNotification({
        userId,
        type,
        title: message,
        message,
      })
      notifications.push(notif)
    }

    return notifications
  }

  /**
   * Get notifications for a user
   */
  static async getNotifications(userId: string, filter: NotificationFilter): Promise<NotificationQueryResult> {
    let sql = `
      SELECT
        n.*,
        json_build_object(
          'id', i.id,
          'title', i.title,
          'status', i.status,
          'severity', i.severity
        ) as incident,
        json_build_object(
          'id', e.id,
          'title', e.title
        ) as error
      FROM notifications n
      LEFT JOIN incidents i ON n.related_incident_id = i.id
      LEFT JOIN errors e ON n.related_error_id = e.id
      WHERE n.user_id = $1
    `

    const values: any[] = [userId]
    let paramCount = 2

    // Apply type filter
    if (filter.type) {
      sql += ` AND n.type = $${paramCount++}`
      values.push(filter.type)
    }

    // Apply read filter
    if (filter.read !== undefined) {
      sql += ` AND n.read = $${paramCount++}`
      values.push(filter.read)
    }

    // Count total
    const countSql = `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1` +
      (filter.type ? ` AND type = $2` : '') +
      (filter.read !== undefined ? ` AND read = ${filter.type ? '$3' : '$2'}` : '')

    const countValues = [userId]
    if (filter.type) countValues.push(filter.type)
    if (filter.read !== undefined) countValues.push(filter.read)

    const countResult = await query(countSql, countValues)
    const total = parseInt(countResult.rows[0].count)

    // Pagination
    const limit = filter.limit || 50
    const offset = filter.offset || 0
    sql += ` ORDER BY n.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
    values.push(limit, offset)

    const result = await query(sql, values)
    const unreadCount = result.rows.filter((n: any) => !n.read).length

    return {
      data: result.rows,
      total,
      unreadCount,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    }
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false`
    const result = await query(sql, [userId])
    return parseInt(result.rows[0].count)
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    const sql = `UPDATE notifications SET read = true, read_at = $1 WHERE id = $2`
    await query(sql, [new Date(), notificationId])
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    const sql = `UPDATE notifications SET read = true, read_at = $1 WHERE user_id = $2 AND read = false`
    await query(sql, [new Date(), userId])
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    const sql = `DELETE FROM notifications WHERE id = $1`
    await query(sql, [notificationId])
  }

  /**
   * Delete old notifications (cleanup job)
   */
  static async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const sql = `DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '${daysOld} days'`
    const result = await query(sql)
    return result.rowCount || 0
  }

  /**
   * Send incident creation notification
   */
  static async notifyIncidentCreated(incidentId: string, userIds: string[]): Promise<void> {
    for (const userId of userIds) {
      await this.sendNotification({
        userId,
        type: 'incident',
        title: 'New Incident Created',
        message: 'A new incident has been created. Please review.',
        relatedIncidentId: incidentId,
      })
    }
  }

  /**
   * Send incident assignment notification
   */
  static async notifyIncidentAssigned(incidentId: string, assignedUserId: string, incidentTitle: string): Promise<void> {
    await this.sendNotification({
      userId: assignedUserId,
      type: 'assignment',
      title: 'Incident Assigned to You',
      message: `You have been assigned to: ${incidentTitle}`,
      relatedIncidentId: incidentId,
    })
  }
}
