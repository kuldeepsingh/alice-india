// @ts-nocheck
/**
 * Premium Only Middleware
 *
 * Checks if user has access to Claude premium features.
 * Blocks requests if user doesn't have sufficient tier/credits.
 *
 * Usage:
 *   router.post('/trading/with-claude', premiumOnlyMiddleware, handler)
 */

import { Request, Response, NextFunction } from 'express'
import { premiumFeatureService } from '../services/premium-feature-service'

/**
 * Check if user is premium tier
 * Blocks non-premium users with 403 error
 */
export const requirePremium = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const isPremium = await premiumFeatureService.isPremiumUser(userId)

    if (!isPremium) {
      return res.status(403).json({
        error: 'This feature requires a premium subscription',
        upgradeUrl: 'https://bot-trade.com/upgrade',
        tier: 'premium',
        price: '₹1,999/month',
      })
    }

    next()
  } catch (error: any) {
    console.error('[Middleware] Premium check error:', error)
    res.status(500).json({ error: 'Error checking premium status' })
  }
}

/**
 * Check if user has specific Claude feature
 * Returns 403 if feature not available
 */
export const requireFeature = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const hasFeature = await premiumFeatureService.hasFeature(userId, feature)

      if (!hasFeature) {
        return res.status(403).json({
          error: `Feature '${feature}' requires a premium subscription`,
          upgradeUrl: 'https://bot-trade.com/upgrade',
          feature,
        })
      }

      next()
    } catch (error: any) {
      console.error('[Middleware] Feature check error:', error)
      res.status(500).json({ error: 'Error checking feature access' })
    }
  }
}

/**
 * Check if user can use Claude API
 * Validates tier and credit balance
 */
export const requireClaudeAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { allowed, reason } = await premiumFeatureService.canUseClaude(userId)

    if (!allowed) {
      return res.status(403).json({
        error: reason || 'Claude features not available',
        upgradeUrl: 'https://bot-trade.com/upgrade',
      })
    }

    // Store in request for later use
    (req as any).canUseClaude = true

    next()
  } catch (error: any) {
    console.error('[Middleware] Claude access check error:', error)
    // Don't block on error - allow request to proceed without Claude
    (req as any).canUseClaude = false
    next()
  }
}

/**
 * Optional Claude enhancement
 * Attaches Claude validation if available, doesn't block
 * Accepts userId from Bearer token OR X-User-ID header
 */
export const optionalClaude = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get userId from Bearer token first, then try X-User-ID header
    let userId = (req as any).userId
    if (!userId) {
      userId = req.headers['x-user-id'] as string
    }

    if (!userId) {
      (req as any).claudeAvailable = false
      return next()
    }

    const result = await premiumFeatureService.canUseClaude(userId)
    if (result && result.allowed) {
      (req as any).claudeAvailable = true
    } else {
      (req as any).claudeAvailable = false
    }

    next()
  } catch (error) {
    // Don't block - just set flag
    (req as any).claudeAvailable = false
    next()
  }
}
