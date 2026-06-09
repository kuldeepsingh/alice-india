// @ts-nocheck
/**
 * Usage Tracking Service
 *
 * Tracks Claude API usage for:
 * - Cost allocation to users
 * - Usage analytics
 * - Rate limiting
 * - Credit management
 * - Premium tier billing
 *
 * Tracks:
 * - Requests per user per day
 * - Cost per request
 * - Feature usage breakdown
 * - Success/error rates
 * - Response times
 */

import { cacheService } from './cache-service'

export interface UsageRecord {
  userId: string
  useCase: string
  timestamp: Date
  responseTimeMs: number
  costInDollars: number
  success: boolean
  error?: string
}

export interface UsageSummary {
  userId: string
  date: string
  totalRequests: number
  totalCostUSD: number
  breakdown: Record<string, number> // {useCase: count}
  successRate: number // 0-1
  avgResponseTimeMs: number
}

export interface UserUsageStats {
  userId: string
  monthlyUsage: number
  monthlyLimit: number
  creditsRemaining: number
  currentCost: number
  lastUpdated: Date
}

class UsageTrackingService {
  private usageRecords: UsageRecord[] = []
  private dailyCache: Map<string, UsageRecord[]> = new Map()

  /**
   * Track a Claude API request
   */
  async trackUsage(record: UsageRecord): Promise<void> {
    try {
      // Add to in-memory tracking
      this.usageRecords.push(record)

      // Update daily cache
      const dateKey = record.timestamp.toISOString().split('T')[0]
      const cacheKey = `usage:${record.userId}:${dateKey}`

      const cached = await cacheService.get<UsageRecord[]>(cacheKey)
      const records = cached || []
      records.push(record)

      // Cache for 24 hours
      await cacheService.set(cacheKey, records, 86400)

      console.log(
        `[UsageTracking] ${record.userId} - ${record.useCase} - $${record.costInDollars.toFixed(4)}`
      )

      // TODO: Persist to database
      // INSERT INTO usage_logs (user_id, use_case, timestamp, response_time, cost, success)
    } catch (error) {
      console.error('[UsageTracking] Error tracking usage:', error)
    }
  }

  /**
   * Get daily usage summary for user
   */
  async getDailySummary(userId: string, date: string): Promise<UsageSummary | null> {
    try {
      const cacheKey = `usage:${userId}:${date}`
      const records = await cacheService.get<UsageRecord[]>(cacheKey)

      if (!records || records.length === 0) {
        return null
      }

      // Calculate breakdown by use case
      const breakdown: Record<string, number> = {}
      let totalCost = 0
      let successCount = 0

      for (const record of records) {
        breakdown[record.useCase] = (breakdown[record.useCase] || 0) + 1
        totalCost += record.costInDollars
        if (record.success) successCount++
      }

      // Calculate average response time
      const avgResponseTime =
        records.reduce((sum, r) => sum + r.responseTimeMs, 0) / records.length

      return {
        userId,
        date,
        totalRequests: records.length,
        totalCostUSD: totalCost,
        breakdown,
        successRate: successCount / records.length,
        avgResponseTimeMs: avgResponseTime,
      }
    } catch (error) {
      console.error('[UsageTracking] Error getting daily summary:', error)
      return null
    }
  }

  /**
   * Get user's current month usage stats
   */
  async getMonthlyStats(userId: string): Promise<UserUsageStats> {
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      let totalRequests = 0
      let totalCost = 0

      // Sum all requests this month
      for (const record of this.usageRecords) {
        if (record.userId === userId && record.timestamp >= monthStart) {
          totalRequests++
          totalCost += record.costInDollars
        }
      }

      // TODO: Fetch from database for historical data
      // SELECT COUNT(*), SUM(cost) FROM usage_logs WHERE user_id = ? AND timestamp >= ?

      // Get user's tier to determine limit
      // TODO: Fetch from premium-feature-service
      const monthlyLimit = 500 // Default premium limit
      const creditsRemaining = monthlyLimit - totalRequests

      return {
        userId,
        monthlyUsage: totalRequests,
        monthlyLimit,
        creditsRemaining,
        currentCost: totalCost,
        lastUpdated: new Date(),
      }
    } catch (error) {
      console.error('[UsageTracking] Error getting monthly stats:', error)
      return {
        userId,
        monthlyUsage: 0,
        monthlyLimit: 0,
        creditsRemaining: 0,
        currentCost: 0,
        lastUpdated: new Date(),
      }
    }
  }

  /**
   * Check if user has exceeded monthly limit
   */
  async hasExceededLimit(userId: string, limit: number): Promise<boolean> {
    const stats = await this.getMonthlyStats(userId)
    return stats.monthlyUsage >= limit
  }

  /**
   * Get cost estimates for different use cases
   */
  static getCostEstimates(): Record<string, number> {
    return {
      signal_validation: 0.0008, // ~200 input + 100 output tokens
      sentiment_analysis: 0.0015, // ~400 input + 100 output tokens
      risk_assessment: 0.003, // ~800 input + 150 output tokens
      strategy_review: 0.004, // ~1000 input + 200 output tokens
      anomaly_detection: 0.0005, // ~100 input + 50 output tokens
    }
  }

  /**
   * Calculate estimated cost
   */
  static calculateCost(useCase: string, tokensUsed: number): number {
    const estimates = this.getCostEstimates()
    const baseCost = estimates[useCase] || 0.001
    // Adjust for actual token usage (rough estimate)
    return baseCost * (tokensUsed / 300) // Assume base is ~300 tokens
  }
}

/**
 * Singleton instance
 */
export const usageTrackingService = new UsageTrackingService()
