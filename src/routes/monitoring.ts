/**
 * Monitoring & Analytics Routes
 *
 * Endpoints for:
 * - System health monitoring
 * - Analytics dashboards
 * - Real-time metrics
 * - Notification management
 * - Alert configuration
 */

import { Router } from 'express'
import { analyticsService } from '../services/analytics-service'
import { notificationService } from '../services/notification-service'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { logger } from '../services/logger'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * GET /monitoring/health
 * 
 * System health check endpoint
 * 
 * Returns:
 * {
 *   "status": "healthy",
 *   "timestamp": "2026-06-08T14:30:00Z",
 *   "metrics": {
 *     "uptime": 86400,
 *     "activeUsers": 42,
 *     "apiCallsSuccess": 5234,
 *     "apiCallsFailed": 23,
 *     "avgResponseTime": 145,
 *     "claudeApiStatus": "operational"
 *   },
 *   "alerts": [...]
 * }
 */
router.get('/health', (_req: AuthRequest, res) => {
  try {
    const metrics = analyticsService.getSystemMetrics()
    const recentAlerts = analyticsService.getRecentAlerts(5)

    const healthScore = metrics.systemHealthScore
    const status = healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'degraded' : 'critical'

    res.json({
      status,
      timestamp: new Date(),
      healthScore,
      metrics: {
        activeUsers: metrics.activeUsers,
        premiumUsers: metrics.premiumUsers,
        ordersCreated: metrics.ordersCreated,
        tradesExecuted: metrics.tradesExecuted,
        avgResponseTime: metrics.avgResponseTime,
        claudeCallsTotal: metrics.claudeCallsTotal,
        claudeCostUSD: metrics.claudeCostUSD.toFixed(2),
      },
      alerts: recentAlerts,
    })
  } catch (error: any) {
    logger.error({
      type: 'health_check_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Health check failed' })
  }
})

/**
 * GET /monitoring/analytics
 * 
 * Get system analytics for dashboard
 * 
 * Returns comprehensive metrics and trends
 */
router.get('/analytics', (_req: AuthRequest, res) => {
  try {
    const metrics = analyticsService.getSystemMetrics()

    res.json({
      status: 'success',
      timestamp: new Date(),
      data: {
        system: {
          healthScore: metrics.systemHealthScore,
          activeUsers: metrics.activeUsers,
          premiumUsers: metrics.premiumUsers,
          premiumConversion: (metrics.premiumUsers / metrics.activeUsers * 100).toFixed(1) + '%',
        },
        trading: {
          ordersCreated: metrics.ordersCreated,
          tradesExecuted: metrics.tradesExecuted,
          successRate: metrics.ordersCreated > 0 
            ? (metrics.tradesExecuted / metrics.ordersCreated * 100).toFixed(1) + '%'
            : '0%',
        },
        api: {
          totalCalls: metrics.apiCallsTotal,
          successfulCalls: metrics.apiCallsSuccess,
          failedCalls: metrics.apiCallsFailed,
          errorRate: metrics.apiCallsTotal > 0
            ? (metrics.apiCallsFailed / metrics.apiCallsTotal * 100).toFixed(1) + '%'
            : '0%',
          avgResponseTime: metrics.avgResponseTime.toFixed(0) + 'ms',
        },
        claude: {
          totalCalls: metrics.claudeCallsTotal,
          successfulCalls: metrics.claudeCallsSuccess,
          totalCostUSD: metrics.claudeCostUSD.toFixed(2),
          avgCostPerCall: metrics.claudeCallsTotal > 0
            ? (metrics.claudeCostUSD / metrics.claudeCallsTotal).toFixed(4)
            : '0.0000',
        },
      },
    })
  } catch (error: any) {
    logger.error({
      type: 'analytics_fetch_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

/**
 * GET /monitoring/user-analytics/:userId
 * 
 * Get analytics for specific user
 */
router.get('/user-analytics/:userId', (req: AuthRequest, res) => {
  try {
    const { userId } = req.params
    const requestingUser = req.user?.userId

    // Users can only view their own analytics (admins could bypass this)
    if (userId !== requestingUser && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const userAnalytics = analyticsService.getUserAnalytics(userId)
    const engagementScore = analyticsService.calculateEngagementScore(userId)

    if (!userAnalytics) {
      return res.status(404).json({ error: 'User analytics not found' })
    }

    res.json({
      status: 'success',
      data: {
        userId,
        engagement: {
          score: engagementScore,
          level: engagementScore >= 80 ? 'high' : engagementScore >= 50 ? 'medium' : 'low',
        },
        trading: {
          totalOrders: userAnalytics.totalOrders,
          successfulOrders: userAnalytics.successfulOrders,
          successRate: userAnalytics.totalOrders > 0
            ? (userAnalytics.successfulOrders / userAnalytics.totalOrders * 100).toFixed(1)
            : '0',
        },
        claudeUsage: {
          totalFeatureUses: userAnalytics.claudeFeaturesUsed,
          featuresUsed: userAnalytics.premiumFeaturesUsed,
          totalCostUSD: userAnalytics.totalCost.toFixed(2),
        },
        activity: {
          lastActive: userAnalytics.lastActive,
          daysActive: Math.floor(
            (new Date().getTime() - userAnalytics.lastActive.getTime()) / (1000 * 60 * 60 * 24)
          ),
        },
      },
    })
  } catch (error: any) {
    logger.error({
      type: 'user_analytics_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to fetch user analytics' })
  }
})

/**
 * GET /monitoring/notifications
 * 
 * Get user's notifications
 */
router.get('/notifications', (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const limit = parseInt(req.query.limit as string) || 20
    const notifications = notificationService.getUserNotifications(userId, limit)
    const unreadCount = notificationService.getUnreadCount(userId)

    res.json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
        total: notifications.length,
      },
    })
  } catch (error: any) {
    logger.error({
      type: 'notifications_fetch_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

/**
 * POST /monitoring/notifications/:id/read
 * 
 * Mark notification as read
 */
router.post('/notifications/:id/read', (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const success = notificationService.markAsRead(userId, id)

    res.json({
      status: 'success',
      marked: success,
    })
  } catch (error: any) {
    logger.error({
      type: 'notification_read_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to mark notification' })
  }
})

/**
 * POST /monitoring/notifications/read-all
 * 
 * Mark all notifications as read
 */
router.post('/notifications/read-all', (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const count = notificationService.markAllAsRead(userId)

    res.json({
      status: 'success',
      markedAsRead: count,
    })
  } catch (error: any) {
    logger.error({
      type: 'mark_all_read_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to mark notifications' })
  }
})

/**
 * DELETE /monitoring/notifications/:id
 * 
 * Delete a notification
 */
router.delete('/notifications/:id', (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    const { id } = req.params

    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const deleted = notificationService.deleteNotification(userId, id)

    res.json({
      status: 'success',
      deleted,
    })
  } catch (error: any) {
    logger.error({
      type: 'notification_delete_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to delete notification' })
  }
})

/**
 * GET /monitoring/alerts
 * 
 * Get recent system alerts
 */
router.get('/alerts', (_req: AuthRequest, res) => {
  try {
    const limit = parseInt(_req.query.limit as string) || 20
    const alerts = analyticsService.getRecentAlerts(limit)

    res.json({
      status: 'success',
      data: {
        alerts,
        critical: alerts.filter(a => a.status === 'critical').length,
        warnings: alerts.filter(a => a.status === 'warning').length,
      },
    })
  } catch (error: any) {
    logger.error({
      type: 'alerts_fetch_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to fetch alerts' })
  }
})

/**
 * WebSocket support for real-time notifications
 * 
 * Usage:
 * const ws = new WebSocket('ws://localhost:3000/monitoring/ws?token=JWT_TOKEN')
 * ws.onmessage = (event) => {
 *   const notification = JSON.parse(event.data)
 * }
 */
export function setupWebSocketMonitoring(io: any) {
  io.on('connection', (socket: any) => {
    const userId = socket.handshake.query.userId

    // Join user-specific room
    socket.join(`user:${userId}`)

    // Listen for notification events
    notificationService.on('notification', (notification) => {
      if (notification.userId === userId) {
        socket.emit('notification', notification)
      }
    })

    // Listen for system alerts
    notificationService.on('system_alert', (alert) => {
      socket.emit('system_alert', alert)
    })

    logger.debug({
      type: 'ws_connected',
      userId,
    })
  })
}

export default router
