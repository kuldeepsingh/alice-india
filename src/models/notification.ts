/**
 * Notification Model
 * Represents user notifications for team coordination and alerts
 */

export type NotificationType = 'incident' | 'assignment' | 'comment' | 'mention' | 'on_call' | 'alert'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message?: string
  relatedIncidentId?: string
  relatedErrorId?: string
  read: boolean
  readAt?: Date
  createdAt: Date
}

export interface NotificationWithDetails extends Notification {
  incident?: {
    id: string
    title: string
    status: string
    severity: string
  }
  error?: {
    id: string
    title: string
  }
}

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message?: string
  relatedIncidentId?: string
  relatedErrorId?: string
}

export interface NotificationFilter {
  userId: string
  type?: NotificationType
  read?: boolean
  limit?: number
  offset?: number
}

export interface NotificationQueryResult {
  data: NotificationWithDetails[]
  total: number
  unreadCount: number
  page: number
  pageSize: number
}

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  INCIDENT: 'incident',
  ASSIGNMENT: 'assignment',
  COMMENT: 'comment',
  MENTION: 'mention',
  ON_CALL: 'on_call',
  ALERT: 'alert',
} as const

/**
 * Get notification template
 */
export function getNotificationTemplate(type: NotificationType): {
  title: string
  messageTemplate: string
} {
  const templates: Record<NotificationType, { title: string; messageTemplate: string }> = {
    incident: {
      title: 'New Incident',
      messageTemplate: 'Incident created: {incidentTitle}',
    },
    assignment: {
      title: 'Incident Assigned',
      messageTemplate: 'You have been assigned to: {incidentTitle}',
    },
    comment: {
      title: 'New Comment',
      messageTemplate: '{user} commented on: {incidentTitle}',
    },
    mention: {
      title: 'You Were Mentioned',
      messageTemplate: '{user} mentioned you in: {incidentTitle}',
    },
    on_call: {
      title: 'On-Call Notification',
      messageTemplate: 'You are on-call from {startDate} to {endDate}',
    },
    alert: {
      title: 'System Alert',
      messageTemplate: '{message}',
    },
  }
  return templates[type]
}
