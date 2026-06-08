/**
 * Market Analysis Routes (Updated with Key Retrieval)
 *
 * Advanced Claude analysis endpoints for premium users:
 * 1. POST /market-analysis/sentiment - Analyze market sentiment
 * 2. POST /market-analysis/risk - Assess trade risk
 * 3. GET /market-analysis/usage - User's usage stats
 * 4. GET /market-analysis/costs - Estimated costs
 *
 * Now fetches Claude API keys from secure backend storage instead of using hardcoded keys.
 */

import { Router } from 'express'
import { ClaudeService } from '../services/claude-service'
import { keyRetrievalService } from '../services/key-retrieval-service'
import { premiumFeatureService } from '../services/premium-feature-service'
import { usageTrackingService } from '../services/usage-tracking-service'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { optionalClaude } from '../middleware/premium-only'
import { logger } from '../services/logger'
import type {
  SentimentAnalysisRequest,
  SentimentAnalysisResponse,
  RiskAssessmentRequest,
  RiskAssessmentResponse,
} from '../models/claude'

const router = Router()

// Helper: Get userId from Bearer token OR X-User-ID header
const getUserId = (req: any): string | null => {
  // Try from Bearer token first (authMiddleware)
  if (req.user?.userId) {
    return req.user.userId
  }
  // Fallback to X-User-ID header
  const xUserId = req.headers['x-user-id'] as string
  if (xUserId) {
    return xUserId
  }
  return null
}

/**
 * POST /market-analysis/sentiment
 *
 * Analyze market sentiment for decision making
 *
 * Now fetches Claude API key from secure backend storage
 * Accepts authentication via Bearer token OR X-User-ID header
 */
router.post('/sentiment', optionalClaude, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - provide Bearer token or X-User-ID header' })
    }

    const { marketData, recentNews, globalContext } = req.body

    if (!marketData) {
      logger.warn({
        type: 'sentiment_validation_failed',
        reason: 'missing_market_data',
        userId,
      })
      return res.status(400).json({ error: 'Missing required field: marketData' })
    }

    logger.debug({
      type: 'sentiment_analysis_starting',
      userId,
    })

    const canUseClaude = (req as any).claudeAvailable === true
    let sentimentAnalysis: SentimentAnalysisResponse | null = null
    let claudeUsed = false

    if (canUseClaude) {
      try {
        // Fetch Claude API key from secure backend storage
        logger.debug({
          type: 'fetching_claude_api_key',
          userId,
        })

        const claudeApiKey = await keyRetrievalService.getClaudeApiKey(userId)

        if (!claudeApiKey) {
          throw new Error('Claude API key not configured. Please configure in Settings.')
        }

        // Create Claude service with fetched API key
        const claudeService = new ClaudeService({
          apiKey: claudeApiKey,
          model: 'claude-3-5-sonnet-20241022',
          maxTokens: 500,
          temperature: 0.3,
          timeout: 2000,
        })

        const startTime = Date.now()
        const claudeRequest: SentimentAnalysisRequest = {
          marketData,
          recentNews,
          globalContext,
        }

        sentimentAnalysis = await claudeService.analyzeSentiment(userId, claudeRequest)
        const responseTime = Date.now() - startTime

        logger.info({
          type: 'sentiment_analysis_completed',
          userId,
          responseTime,
          sentiment: sentimentAnalysis.sentiment,
        })

        claudeUsed = true

        // Track usage
        await usageTrackingService.recordClaudeCall(userId, {
          type: 'sentiment_analysis',
          responseTime,
          success: true,
        })
      } catch (error: any) {
        logger.warn({
          type: 'claude_analysis_error',
          userId,
          error: error.message,
        })

        await usageTrackingService.recordClaudeCall(userId, {
          type: 'sentiment_analysis',
          success: false,
          error: error.message,
        })

        // Continue with fallback - don't block user
      }
    }

    // Return response
    const response: any = {
      sentiment: sentimentAnalysis?.sentiment || 0.5,
      trend: sentimentAnalysis?.trend || 'neutral',
      confidence: sentimentAnalysis?.confidence || 0.5,
      reasoning: sentimentAnalysis?.reasoning || 'Analysis unavailable',
      preferred_trades: sentimentAnalysis?.preferred_trades || [],
      caution_points: sentimentAnalysis?.caution_points || [],
      claudeUsed,
    }

    res.json(response)
  } catch (error: any) {
    logger.error({
      type: 'sentiment_endpoint_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to analyze sentiment' })
  }
})

/**
 * POST /market-analysis/risk
 *
 * Assess trade risk using Claude
 * Accepts authentication via Bearer token OR X-User-ID header
 */
router.post('/risk', optionalClaude, async (req: AuthRequest, res) => {
  try {
    const userId = getUserId(req)

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - provide Bearer token or X-User-ID header' })
    }

    const { tradeDetails, marketContext, userProfile } = req.body

    if (!tradeDetails) {
      return res.status(400).json({ error: 'Missing required field: tradeDetails' })
    }

    logger.debug({
      type: 'risk_assessment_starting',
      userId,
    })

    const canUseClaude = (req as any).claudeAvailable === true
    let riskAssessment: RiskAssessmentResponse | null = null
    let claudeUsed = false

    if (canUseClaude) {
      try {
        // Fetch Claude API key from secure backend storage
        const claudeApiKey = await keyRetrievalService.getClaudeApiKey(userId)

        if (!claudeApiKey) {
          throw new Error('Claude API key not configured')
        }

        // Create Claude service with fetched API key
        const claudeService = new ClaudeService({
          apiKey: claudeApiKey,
          model: 'claude-3-5-sonnet-20241022',
          maxTokens: 500,
          temperature: 0.3,
          timeout: 2000,
        })

        const startTime = Date.now()
        const riskRequest: RiskAssessmentRequest = {
          tradeDetails,
          marketContext,
          userProfile,
        }

        riskAssessment = await claudeService.assessRisk(userId, riskRequest)
        const responseTime = Date.now() - startTime

        logger.info({
          type: 'risk_assessment_completed',
          userId,
          responseTime,
          riskLevel: riskAssessment.riskLevel,
        })

        claudeUsed = true

        await usageTrackingService.recordClaudeCall(userId, {
          type: 'risk_assessment',
          responseTime,
          success: true,
        })
      } catch (error: any) {
        logger.warn({
          type: 'claude_risk_error',
          userId,
          error: error.message,
        })

        await usageTrackingService.recordClaudeCall(userId, {
          type: 'risk_assessment',
          success: false,
          error: error.message,
        })
      }
    }

    // Return response
    const response: any = {
      riskLevel: riskAssessment?.riskLevel || 'medium',
      score: riskAssessment?.score || 0.5,
      factors: riskAssessment?.factors || [],
      recommendations: riskAssessment?.recommendations || [],
      claudeUsed,
    }

    res.json(response)
  } catch (error: any) {
    logger.error({
      type: 'risk_endpoint_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to assess risk' })
  }
})

/**
 * GET /market-analysis/usage
 * Get user's Claude usage statistics
 */
router.get('/usage', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const stats = await usageTrackingService.getUserAnalytics(userId)

    res.json({
      totalCalls: stats.totalClaudeCalls || 0,
      successfulCalls: stats.successfulCalls || 0,
      failedCalls: stats.failedCalls || 0,
      averageResponseTime: stats.averageResponseTime || 0,
      lastCall: stats.lastClaudeCall || null,
    })
  } catch (error: any) {
    logger.error({
      type: 'usage_endpoint_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to get usage stats' })
  }
})

export default router
