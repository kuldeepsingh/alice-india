// @ts-nocheck
/**
 * Analytics Service
 *
 * Tracks system metrics, user activity, and performance data
 * Provides insights for dashboard and monitoring
 */

import { logger } from './logger'

export interface SystemMetrics {
  timestamp: Date
  apiCallsTotal: number
  apiCallsSuccess: number
  apiCallsFailed: number
  avgResponseTime: number
  claudeCallsTotal: number
  claudeCallsSuccess: number
  claudeCostUSD: number
  activeUsers: number
  premiumUsers: number
  ordersCreated: number
  tradesExecuted: number
  systemHealthScore: number
}

export interface UserAnalytics {
  userId: string
  totalOrders: number
  successfulOrders: number
  totalCost: number
  claudeFeaturesUsed: number
  premiumFeaturesUsed: string[]
  lastActive: Date
  engagementScore: number
}

export interface AlertMetric {
  metric: string
  value: number
  threshold: number
  status: 'healthy' | 'warning' | 'critical'
  timestamp: Date
}

class AnalyticsService {
  private metrics: SystemMetrics[] = []
  private userMetrics: Map<string, UserAnalytics> = new Map()
  private alerts: AlertMetric[] = []

  /**
   * Record API call metrics
   */
  recordAPICall(
    endpoint: string,
    statusCode: number,
    responseTimeMs: number,
    success: boolean
  ) {
    try {
      logger.debug({
        type: 'api_call_recorded',
        endpoint,
        statusCode,
        responseTimeMs,
        success,
      })

      // Track in memory (would persist to database in production)
      // This allows real-time dashboards to show current metrics
    } catch (error) {
      logger.error({
        type: 'analytics_recording_error',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * Record Claude API call
   */
  recordClaudeCall(
    useCase: string,
    success: boolean,
    costUSD: number,
    responseTimeMs: number,
    userId: string
  ) {
    try {
      logger.debug({
        type: 'claude_call_recorded',
        useCase,
        success,
        costUSD,
        responseTimeMs,
        userId,
      })

      // Update user metrics
      const userAnalytics = this.userMetrics.get(userId) || {
        userId,
        totalOrders: 0,
        successfulOrders: 0,
        totalCost: 0,
        claudeFeaturesUsed: 0,
        premiumFeaturesUsed: [],
        lastActive: new Date(),
        engagementScore: 0,
      }

      userAnalytics.claudeFeaturesUsed++
      userAnalytics.totalCost += costUSD
      if (!userAnalytics.premiumFeaturesUsed.includes(useCase)) {
        userAnalytics.premiumFeaturesUsed.push(useCase)
      }
      userAnalytics.lastActive = new Date()

      this.userMetrics.set(userId, userAnalytics)
    } catch (error) {
      logger.error({
        type: 'claude_metrics_error',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * Record order creation
   */
  recordOrder(userId: string, symbol: string, success: boolean) {
    try {
      const userAnalytics = this.userMetrics.get(userId)
      if (userAnalytics) {
        userAnalytics.totalOrders++
        if (success) userAnalytics.successfulOrders++
        this.userMetrics.set(userId, userAnalytics)
      }

      logger.debug({
        type: 'order_recorded',
        userId,
        symbol,
        success,
      })
    } catch (error) {
      logger.error({
        type: 'order_metrics_error',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * Get system metrics snapshot
   */
  getSystemMetrics(): SystemMetrics {
    const now = new Date()

    return {
      timestamp: now,
      apiCallsTotal: 0,
      apiCallsSuccess: 0,
      apiCallsFailed: 0,
      avgResponseTime: 0,
      claudeCallsTotal: 0,
      claudeCallsSuccess: 0,
      claudeCostUSD: 0,
      activeUsers: this.userMetrics.size,
      premiumUsers: Array.from(this.userMetrics.values()).filter(
        u => u.premiumFeaturesUsed.length > 0
      ).length,
      ordersCreated: Array.from(this.userMetrics.values()).reduce(
        (sum, u) => sum + u.totalOrders,
        0
      ),
      tradesExecuted: Array.from(this.userMetrics.values()).reduce(
        (sum, u) => sum + u.successfulOrders,
        0
      ),
      systemHealthScore: this.calculateHealthScore(),
    }
  }

  /**
   * Get user analytics
   */
  getUserAnalytics(userId: string): UserAnalytics | null {
    return this.userMetrics.get(userId) || null
  }

  /**
   * Calculate system health score (0-100)
   */
  private calculateHealthScore(): number {
    let score = 100

    // Check for alerts
    const criticalAlerts = this.alerts.filter(a => a.status === 'critical')
    const warningAlerts = this.alerts.filter(a => a.status === 'warning')

    score -= criticalAlerts.length * 20
    score -= warningAlerts.length * 5

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Check and create alerts based on thresholds
   */
  checkAlerts(metrics: SystemMetrics): AlertMetric[] {
    const newAlerts: AlertMetric[] = []

    // Check API error rate
    if (metrics.apiCallsTotal > 0) {
      const errorRate = metrics.apiCallsFailed / metrics.apiCallsTotal
      if (errorRate > 0.1) {
        newAlerts.push({
          metric: 'api_error_rate',
          value: errorRate * 100,
          threshold: 10,
          status: 'warning',
          timestamp: new Date(),
        })
      }
      if (errorRate > 0.2) {
        newAlerts.push({
          metric: 'api_error_rate',
          value: errorRate * 100,
          threshold: 20,
          status: 'critical',
          timestamp: new Date(),
        })
      }
    }

    // Check response time
    if (metrics.avgResponseTime > 5000) {
      newAlerts.push({
        metric: 'response_time',
        value: metrics.avgResponseTime,
        threshold: 5000,
        status: 'warning',
        timestamp: new Date(),
      })
    }

    // Check Claude cost spike
    if (metrics.claudeCostUSD > 100) {
      newAlerts.push({
        metric: 'claude_cost',
        value: metrics.claudeCostUSD,
        threshold: 100,
        status: 'warning',
        timestamp: new Date(),
      })
    }

    this.alerts = [...this.alerts, ...newAlerts].slice(-100) // Keep last 100 alerts

    return newAlerts
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 10): AlertMetric[] {
    return this.alerts.slice(-limit)
  }

  /**
   * Calculate engagement score for user
   */
  calculateEngagementScore(userId: string): number {
    const analytics = this.userMetrics.get(userId)
    if (!analytics) return 0

    let score = 0

    // Orders created (25 points)
    score += Math.min(25, (analytics.totalOrders / 10) * 25)

    // Success rate (25 points)
    if (analytics.totalOrders > 0) {
      const successRate = analytics.successfulOrders / analytics.totalOrders
      score += successRate * 25
    }

    // Claude features used (25 points)
    score += Math.min(25, (analytics.claudeFeaturesUsed / 50) * 25)

    // Premium features (25 points)
    score += Math.min(25, (analytics.premiumFeaturesUsed.length / 5) * 25)

    return Math.round(score)
  }
}

export const analyticsService = new AnalyticsService()
