// @ts-nocheck
/**
 * Notification Service
 *
 * Manages real-time notifications for:
 * - Trade alerts (anomalies, risk warnings)
 * - System alerts (API errors, quota warnings)
 * - Performance alerts (slow responses, high costs)
 * - User notifications (order confirmation, analysis ready)
 */

import { EventEmitter } from 'events'
import { logger } from './logger'

export type NotificationType = 'order' | 'alert' | 'system' | 'warning' | 'success'
export type NotificationSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  severity: NotificationSeverity
  title: string
  message: string
  metadata?: Record<string, any>
  timestamp: Date
  read: boolean
  actionUrl?: string
}

class NotificationService extends EventEmitter {
  private notifications: Map<string, Notification[]> = new Map()
  private maxNotificationsPerUser = 100

  /**
   * Send notification to user
   */
  sendNotification(
    userId: string,
    type: NotificationType,
    severity: NotificationSeverity,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      severity,
      title,
      message,
      metadata,
      timestamp: new Date(),
      read: false,
    }

    // Store notification
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, [])
    }

    const userNotifications = this.notifications.get(userId)!
    userNotifications.push(notification)

    // Keep only recent notifications
    if (userNotifications.length > this.maxNotificationsPerUser) {
      userNotifications.shift()
    }

    // Emit event for real-time delivery
    this.emit('notification', notification)

    logger.info({
      type: 'notification_sent',
      userId,
      notificationType: type,
      severity,
      title,
    })

    return notification
  }

  /**
   * Send order notification
   */
  sendOrderNotification(userId: string, orderId: string, status: string) {
    return this.sendNotification(
      userId,
      'order',
      'success',
      `Order ${status}`,
      `Order ${orderId} has been ${status}`,
      { orderId, status }
    )
  }

  /**
   * Send anomaly alert
   */
  sendAnomalyAlert(
    userId: string,
    symbol: string,
    anomalyType: string,
    severity: NotificationSeverity
  ) {
    return this.sendNotification(
      userId,
      'alert',
      severity,
      `Anomaly Detected: ${symbol}`,
      `${anomalyType} detected in ${symbol}. Review immediately.`,
      { symbol, anomalyType }
    )
  }

  /**
   * Send risk warning
   */
  sendRiskWarning(userId: string, issue: string, recommendation: string) {
    return this.sendNotification(
      userId,
      'warning',
      'warning',
      'Risk Warning',
      issue,
      { recommendation }
    )
  }

  /**
   * Send system alert
   */
  sendSystemAlert(title: string, message: string, severity: NotificationSeverity = 'warning') {
    // Notify all users
    const notification: Notification = {
      id: `sys-${Date.now()}`,
      userId: 'system',
      type: 'system',
      severity,
      title,
      message,
      timestamp: new Date(),
      read: false,
    }

    this.emit('system_alert', notification)

    logger.warn({
      type: 'system_alert',
      title,
      message,
      severity,
    })

    return notification
  }

  /**
   * Send analysis ready notification
   */
  sendAnalysisReady(userId: string, analysisType: string, resultId: string) {
    return this.sendNotification(
      userId,
      'success',
      'info',
      `${analysisType} Analysis Ready`,
      `Your ${analysisType} analysis is ready to review`,
      { analysisType, resultId },
      resultId // Include action URL
    )
  }

  /**
   * Get unread notifications for user
   */
  getUnreadNotifications(userId: string): Notification[] {
    const userNotifications = this.notifications.get(userId) || []
    return userNotifications.filter(n => !n.read)
  }

  /**
   * Get all notifications for user
   */
  getUserNotifications(userId: string, limit: number = 50): Notification[] {
    const userNotifications = this.notifications.get(userId) || []
    return userNotifications.slice(-limit)
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId)
    if (!userNotifications) return false

    const notification = userNotifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      return true
    }

    return false
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId: string): number {
    const userNotifications = this.notifications.get(userId) || []
    let count = 0

    for (const notification of userNotifications) {
      if (!notification.read) {
        notification.read = true
        count++
      }
    }

    return count
  }

  /**
   * Delete notification
   */
  deleteNotification(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId)
    if (!userNotifications) return false

    const index = userNotifications.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      userNotifications.splice(index, 1)
      return true
    }

    return false
  }

  /**
   * Get notification count
   */
  getUnreadCount(userId: string): number {
    return this.getUnreadNotifications(userId).length
  }

  /**
   * Send premium feature reminder
   */
  sendPremiumReminder(userId: string, feature: string) {
    return this.sendNotification(
      userId,
      'system',
      'info',
      `Upgrade for ${feature}`,
      `Premium members get access to ${feature}. Consider upgrading!`,
      { feature }
    )
  }

  /**
   * Send usage warning
   */
  sendUsageWarning(userId: string, creditsRemaining: number, monthlyLimit: number) {
    const percentRemaining = (creditsRemaining / monthlyLimit) * 100

    let severity: NotificationSeverity = 'info'
    if (percentRemaining < 10) severity = 'critical'
    else if (percentRemaining < 25) severity = 'warning'

    return this.sendNotification(
      userId,
      'warning',
      severity,
      'Claude API Usage Warning',
      `Only ${creditsRemaining}/${monthlyLimit} Claude requests remaining this month`,
      { creditsRemaining, monthlyLimit }
    )
  }
}

export const notificationService = new NotificationService()
