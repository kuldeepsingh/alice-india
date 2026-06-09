// @ts-nocheck
/**
 * Notification API Routes
 * GET, PUT, DELETE endpoints for notification management
 */

import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { NotificationService } from '../services/notification-service.ts'
import { requireDeveloper } from '../middleware/rbac.ts'

const router = Router()

/**
 * POST /api/v1/notifications
 * Send a notification (internal use only)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, relatedIncidentId } = req.body

    if (!userId || !type || !title) {
      return res.status(400).json({
        status: 'error',
        message: 'userId, type, and title are required',
      })
    }

    const notification = await NotificationService.sendNotification({
      userId,
      type,
      title,
      message,
      relatedIncidentId,
    })

    res.status(201).json({
      status: 'success',
      data: notification,
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error sending notification:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to send notification',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * GET /api/v1/notifications
 * Get user's notifications
 * Auth: Developer+
 * Query params: type, read, limit, offset
 */
router.get('/', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    const { type, read, limit = 50, offset = 0 } = req.query

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' })
    }

    const readBool = read === 'true' ? true : read === 'false' ? false : undefined

    const result = await NotificationService.getNotifications(userId, {
      userId,
      type: type as any,
      read: readBool,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0,
    })

    res.status(200).json({
      status: 'success',
      data: result.data,
      unreadCount: result.unreadCount,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch notifications',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * GET /api/v1/notifications/unread/count
 * Get unread notification count
 * Auth: Developer+
 */
router.get('/unread/count', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' })
    }

    const unreadCount = await NotificationService.getUnreadCount(userId)

    res.status(200).json({
      status: 'success',
      unreadCount,
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error fetching unread count:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch unread count',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * PUT /api/v1/notifications/:id/read
 * Mark notification as read
 * Auth: Developer+
 */
router.put('/:id/read', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' })
    }

    if (!id || !uuidv4.validate(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid notification ID',
      })
    }

    await NotificationService.markAsRead(id)

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to mark notification as read',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * PUT /api/v1/notifications/mark-all-read
 * Mark all notifications as read
 * Auth: Developer+
 */
router.put('/mark-all-read', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' })
    }

    await NotificationService.markAllAsRead(userId)

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to mark all notifications as read',
      correlationId: (req as any).correlationId,
    })
  }
})

/**
 * DELETE /api/v1/notifications/:id
 * Delete a notification
 * Auth: Developer+
 */
router.delete('/:id', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'User not authenticated' })
    }

    if (!id || !uuidv4.validate(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid notification ID',
      })
    }

    await NotificationService.deleteNotification(id)

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted',
      correlationId: (req as any).correlationId,
    })
  } catch (error: any) {
    console.error('Error deleting notification:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete notification',
      correlationId: (req as any).correlationId,
    })
  }
})

export default router
