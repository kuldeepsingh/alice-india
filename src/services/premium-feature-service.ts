/**
 * Premium Feature Service
 *
 * Manages premium tier features and access control.
 * Tracks:
 * - User subscription tier
 * - Claude API credits
 * - Feature availability
 * - Usage limits
 */

import { cacheService } from './cache-service'

/**
 * Subscription tiers
 */
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise'

/**
 * User subscription details
 */
export interface UserSubscription {
  userId: string
  tier: SubscriptionTier
  claudeCreditsMonthly: number
  claudeCreditsUsed: number
  features: string[]
  expiresAt?: Date
}

/**
 * Premium Feature Service
 */
export class PremiumFeatureService {
  /**
   * Check if user has premium tier
   * Returns true for 'premium' or 'enterprise' tiers
   */
  async isPremiumUser(userId: string): Promise<boolean> {
    try {
      // Check cache first
      const cacheKey = `premium:${userId}`
      const cached = await cacheService.get<boolean>(cacheKey)

      if (cached !== null) {
        return cached
      }

      // TODO: Fetch from database
      // For now, return false (will implement DB integration in Phase 1)
      const isPremium = false

      // Cache for 1 hour
      await cacheService.set(cacheKey, isPremium, 3600)

      return isPremium
    } catch (error) {
      console.error('[PremiumFeatureService] Premium check error:', error)
      return false // Default to free tier on error
    }
  }

  /**
   * Get user's subscription tier
   */
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    try {
      const cacheKey = `user:tier:${userId}`
      const cached = await cacheService.get<SubscriptionTier>(cacheKey)

      if (cached) {
        return cached
      }

      // TODO: Fetch from database
      const tier: SubscriptionTier = 'free'

      await cacheService.set(cacheKey, tier, 3600)
      return tier
    } catch (error) {
      console.error('[PremiumFeatureService] Get tier error:', error)
      return 'free'
    }
  }

  /**
   * Get Claude credit balance
   */
  async getClaudeCredits(userId: string): Promise<number> {
    try {
      // TODO: Fetch from database
      return 0 // Free tier gets 0 credits
    } catch (error) {
      console.error('[PremiumFeatureService] Get credits error:', error)
      return 0
    }
  }

  /**
   * Deduct Claude credit after use
   */
  async deductClaudeCredit(userId: string, credits: number = 1): Promise<boolean> {
    try {
      const available = await this.getClaudeCredits(userId)

      if (available < credits) {
        console.warn(
          `[PremiumFeatureService] Insufficient credits for user ${userId}. Available: ${available}, Required: ${credits}`
        )
        return false
      }

      // TODO: Update database
      // Invalidate cache
      await cacheService.delete(`premium:${userId}`)

      return true
    } catch (error) {
      console.error('[PremiumFeatureService] Deduct credits error:', error)
      return false
    }
  }

  /**
   * Check if feature is available for user
   */
  async hasFeature(userId: string, feature: string): Promise<boolean> {
    try {
      const tier = await this.getUserTier(userId)

      // Feature availability by tier
      const featuresByTier: Record<SubscriptionTier, string[]> = {
        free: [],
        basic: ['claude_signal_validation'], // 50 requests/month
        premium: [
          'claude_signal_validation',
          'claude_sentiment_analysis',
          'claude_risk_assessment',
          'claude_strategy_review',
          'claude_anomaly_detection',
        ], // 500 requests/month
        enterprise: [
          'claude_signal_validation',
          'claude_sentiment_analysis',
          'claude_risk_assessment',
          'claude_strategy_review',
          'claude_anomaly_detection',
        ], // Unlimited
      }

      const allowedFeatures = featuresByTier[tier] || []
      return allowedFeatures.includes(feature)
    } catch (error) {
      console.error('[PremiumFeatureService] Has feature error:', error)
      return false
    }
  }

  /**
   * Get all enabled Claude features for user
   */
  async getEnabledFeatures(userId: string): Promise<string[]> {
    try {
      const tier = await this.getUserTier(userId)

      const featuresByTier: Record<SubscriptionTier, string[]> = {
        free: [],
        basic: ['claude_signal_validation'],
        premium: [
          'claude_signal_validation',
          'claude_sentiment_analysis',
          'claude_risk_assessment',
          'claude_strategy_review',
          'claude_anomaly_detection',
        ],
        enterprise: [
          'claude_signal_validation',
          'claude_sentiment_analysis',
          'claude_risk_assessment',
          'claude_strategy_review',
          'claude_anomaly_detection',
        ],
      }

      return featuresByTier[tier] || []
    } catch (error) {
      console.error('[PremiumFeatureService] Get features error:', error)
      return []
    }
  }

  /**
   * Check if user has available credits for Claude request
   */
  async canUseClaude(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const tier = await this.getUserTier(userId)

      // Free tier cannot use Claude
      if (tier === 'free') {
        return {
          allowed: false,
          reason: 'Claude features only available for premium users',
        }
      }

      // Check credit balance for non-enterprise tiers
      if (tier !== 'enterprise') {
        const credits = await this.getClaudeCredits(userId)
        if (credits <= 0) {
          return {
            allowed: false,
            reason: 'Insufficient Claude credits. Upgrade to continue using Claude features.',
          }
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error('[PremiumFeatureService] Can use Claude error:', error)
      return { allowed: false, reason: 'Error checking Claude access' }
    }
  }

  /**
   * Get credit limits for each tier
   */
  static getCreditLimits(): Record<SubscriptionTier, number> {
    return {
      free: 0,
      basic: 50,
      premium: 500,
      enterprise: -1, // Unlimited
    }
  }

  /**
   * Get monthly cost for each tier
   */
  static getTierPricing(): Record<SubscriptionTier, number> {
    return {
      free: 0,
      basic: 499, // ₹
      premium: 1999, // ₹
      enterprise: 9999, // ₹ (custom)
    }
  }
}

/**
 * Singleton instance
 */
export const premiumFeatureService = new PremiumFeatureService()
