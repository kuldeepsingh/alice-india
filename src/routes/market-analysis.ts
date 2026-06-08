/**
 * Market Analysis Routes
 *
 * Advanced Claude analysis endpoints for premium users:
 * 1. POST /market-analysis/sentiment - Analyze market sentiment
 * 2. POST /market-analysis/risk - Assess trade risk
 * 3. GET /market-analysis/usage - User's usage stats
 * 4. GET /market-analysis/costs - Estimated costs
 *
 * All endpoints require authentication and premium tier (except /costs)
 */

import { Router } from 'express'
import { claudeService } from '../services/claude-service'
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

// All routes require authentication
router.use(authMiddleware)

/**
 * POST /market-analysis/sentiment
 *
 * Analyze market sentiment for decision making
 *
 * Request:
 * {
 *   "marketData": {
 *     "index_level": 78000,
 *     "index_change_percent": 0.85,
 *     "sector_performance": { "IT": 0.3, "Finance": 1.5 },
 *     "breadth": { "advances": 1850, "declines": 850 },
 *     "volatility_index": 16.2,
 *     "put_call_ratio": 0.92,
 *     "fii_flow": 150000000
 *   },
 *   "recentNews": ["RBI meets...", "Q4 earnings..."],
 *   "globalContext": "US markets positive, ..."
 * }
 *
 * Response (Premium):
 * {
 *   "sentiment": 0.72,
 *   "trend": "moderate_bull",
 *   "confidence": 0.78,
 *   "reasoning": "Strong breadth...",
 *   "preferred_trades": ["momentum", "sector_rotation"],
 *   "caution_points": ["Watch earnings", "Monitor FII flows"]
 * }
 */
router.post('/sentiment', optionalClaude, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
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
        const startTime = Date.now()
        const claudeRequest: SentimentAnalysisRequest = {
          marketData,
          recentNews,
          globalContext,
        }

        sentimentAnalysis = await claudeService.analyzeSentiment(userId, claudeRequest)
        const responseTime = Date.now() - startTime

        claudeUsed = true

        // Track usage
        await usageTrackingService.trackUsage({
          userId,
          useCase: 'sentiment_analysis',
          timestamp: new Date(),
          responseTimeMs: responseTime,
          costInDollars: 0.0015,
          success: true,
        })

        logger.info({
          type: 'sentiment_analysis_completed',
          userId,
          responseTime,
          sentiment: sentimentAnalysis.sentiment,
          trend: sentimentAnalysis.trend,
        })
      } catch (claudeError: any) {
        logger.error({
          type: 'sentiment_analysis_error',
          userId,
          error: claudeError.message,
        })

        // Track error
        await usageTrackingService.trackUsage({
          userId,
          useCase: 'sentiment_analysis',
          timestamp: new Date(),
          responseTimeMs: 0,
          costInDollars: 0,
          success: false,
          error: claudeError.message,
        })

        sentimentAnalysis = null
      }
    }

    const response: any = {
      status: 'success',
      sentimentAnalysis: sentimentAnalysis || null,
    }

    if (sentimentAnalysis) {
      response.message = 'Market sentiment analysis complete'
      response.claudeUsed = true
    } else if (canUseClaude) {
      response.message = 'Sentiment analysis failed. Try again later.'
    } else {
      response.message = 'Upgrade to premium for market sentiment analysis'
    }

    res.json(response)
  } catch (error: any) {
    logger.error({
      type: 'sentiment_endpoint_error',
      userId: (req as any).user?.userId,
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to analyze sentiment' })
  }
})

/**
 * POST /market-analysis/risk
 *
 * Assess if a proposed trade is appropriate for user's portfolio
 *
 * Request:
 * {
 *   "proposedTrade": {
 *     "symbol": "RELIANCE",
 *     "direction": "long",
 *     "entryPrice": 2850,
 *     "quantity": 100,
 *     "stopLoss": 2778,
 *     "takeProfit": 2950,
 *     "timeHorizon": "1 week"
 *   },
 *   "userPortfolio": {
 *     "totalBalance": 500000,
 *     "cashAvailable": 50000,
 *     "marginUsedPercent": 45,
 *     "activePositions": 5,
 *     "currentDrawdown": -3.5,
 *     "beta": 1.2
 *   },
 *   "userRiskProfile": "moderate"
 * }
 *
 * Response (Premium):
 * {
 *   "isAppropriate": true,
 *   "riskScore": 0.68,
 *   "reasoning": "Position size within limits. Margin tight but acceptable.",
 *   "marginSafety": "tight",
 *   "sectorConcentration": "balanced",
 *   "recommendation": "Approve with adjustments",
 *   "suggestedAdjustments": {
 *     "position_size": "Reduce to 50 shares",
 *     "margin_cushion": "Ensure ₹75k buffer",
 *     "hedging": "Consider protective puts"
 *   }
 * }
 */
router.post('/risk', optionalClaude, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { proposedTrade, userPortfolio, userRiskProfile } = req.body

    if (!proposedTrade || !userPortfolio) {
      logger.warn({
        type: 'risk_assessment_validation_failed',
        reason: 'missing_fields',
        userId,
      })
      return res.status(400).json({
        error: 'Missing required fields: proposedTrade, userPortfolio, userRiskProfile',
      })
    }

    logger.debug({
      type: 'risk_assessment_starting',
      userId,
      symbol: proposedTrade.symbol,
    })

    const canUseClaude = (req as any).claudeAvailable === true
    let riskAnalysis: RiskAssessmentResponse | null = null
    let claudeUsed = false

    if (canUseClaude) {
      try {
        const startTime = Date.now()
        const claudeRequest: RiskAssessmentRequest = {
          proposedTrade,
          userPortfolio,
          userRiskProfile,
        }

        riskAnalysis = await claudeService.assessRisk(userId, claudeRequest)
        const responseTime = Date.now() - startTime

        claudeUsed = true

        // Track usage
        await usageTrackingService.trackUsage({
          userId,
          useCase: 'risk_assessment',
          timestamp: new Date(),
          responseTimeMs: responseTime,
          costInDollars: 0.003,
          success: true,
        })

        logger.info({
          type: 'risk_assessment_completed',
          userId,
          symbol: proposedTrade.symbol,
          responseTime,
          riskScore: riskAnalysis.riskScore,
          recommendation: riskAnalysis.recommendation,
        })
      } catch (claudeError: any) {
        logger.error({
          type: 'risk_assessment_error',
          userId,
          symbol: proposedTrade.symbol,
          error: claudeError.message,
        })

        // Track error
        await usageTrackingService.trackUsage({
          userId,
          useCase: 'risk_assessment',
          timestamp: new Date(),
          responseTimeMs: 0,
          costInDollars: 0,
          success: false,
          error: claudeError.message,
        })

        riskAnalysis = null
      }
    }

    const response: any = {
      status: 'success',
      riskAnalysis: riskAnalysis || null,
    }

    if (riskAnalysis) {
      response.message = 'Risk assessment complete'
      response.claudeUsed = true
    } else if (canUseClaude) {
      response.message = 'Risk assessment failed. Try again later.'
    } else {
      response.message = 'Upgrade to premium for risk assessment'
    }

    res.json(response)
  } catch (error: any) {
    logger.error({
      type: 'risk_endpoint_error',
      userId: (req as any).user?.userId,
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to assess risk' })
  }
})

/**
 * GET /market-analysis/usage
 *
 * Get current user's usage statistics
 *
 * Response:
 * {
 *   "monthlyUsage": 125,
 *   "monthlyLimit": 500,
 *   "creditsRemaining": 375,
 *   "currentCost": "$0.40",
 *   "lastUpdated": "2026-06-08T14:32:45Z"
 * }
 */
router.get('/usage', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const stats = await usageTrackingService.getMonthlyStats(userId)

    res.json({
      status: 'success',
      usage: {
        monthlyUsage: stats.monthlyUsage,
        monthlyLimit: stats.monthlyLimit,
        creditsRemaining: stats.creditsRemaining,
        currentCostUSD: stats.currentCost.toFixed(2),
        usagePercent: ((stats.monthlyUsage / stats.monthlyLimit) * 100).toFixed(1),
        lastUpdated: stats.lastUpdated,
      },
    })
  } catch (error: any) {
    logger.error({
      type: 'usage_endpoint_error',
      userId: (req as any).user?.userId,
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to fetch usage stats' })
  }
})

/**
 * GET /market-analysis/costs
 *
 * Get cost estimates for different analysis types
 * Available to all users (no premium check)
 *
 * Response:
 * {
 *   "costs": {
 *     "signal_validation": 0.0008,
 *     "sentiment_analysis": 0.0015,
 *     "risk_assessment": 0.003,
 *     "strategy_review": 0.004,
 *     "anomaly_detection": 0.0005
 *   },
 *   "monthlyEstimate": {
 *     "premium": 0.40,
 *     "enterprise": "custom"
 *   }
 * }
 */
router.get('/costs', (_req: AuthRequest, res) => {
  try {
    const costs = usageTrackingService.constructor.getCostEstimates()

    res.json({
      status: 'success',
      costPerAnalysis: costs,
      monthlyEstimates: {
        basic: (costs.signal_validation * 50).toFixed(2),
        premium: (costs.signal_validation * 500 * 0.5).toFixed(2), // Average
        enterprise: 'Custom pricing',
      },
      note: 'Costs shown in USD. Prices in INR available upon request.',
    })
  } catch (error: any) {
    logger.error({
      type: 'costs_endpoint_error',
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to fetch cost information' })
  }
})

export default router
