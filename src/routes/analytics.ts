/**
 * Advanced Analytics Routes
 *
 * Premium endpoints for advanced trading insights:
 * 1. POST /analytics/strategy-review - Analyze strategy performance
 * 2. POST /analytics/detect-anomaly - Detect unusual patterns
 * 3. POST /analytics/recommendations - Get optimization recommendations
 * 4. GET /analytics/optimization-score - Calculate optimization score
 *
 * All endpoints require authentication and premium tier
 */

import { Router } from 'express'
import { strategyReviewService } from '../services/strategy-review-service'
import { anomalyDetectionService } from '../services/anomaly-detection-service'
import { optimizationService } from '../services/optimization-service'
import { usageTrackingService } from '../services/usage-tracking-service'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { optionalClaude } from '../middleware/premium-only'
import { logger } from '../services/logger'
import type { StrategyPerformance, OptimizationContext } from '../services'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * POST /analytics/strategy-review
 *
 * Analyze trading strategy performance using Claude
 *
 * Request:
 * {
 *   "strategyId": "strat-123",
 *   "name": "Golden Cross",
 *   "totalTrades": 45,
 *   "winningTrades": 28,
 *   "losingTrades": 17,
 *   "avgWin": 2500,
 *   "avgLoss": 1800,
 *   "profitFactor": 1.82,
 *   "sharpeRatio": 1.45,
 *   "maxDrawdown": -0.12,
 *   "periodStart": "2026-01-01T00:00:00Z",
 *   "periodEnd": "2026-06-08T00:00:00Z"
 * }
 *
 * Response (Premium):
 * {
 *   "status": "success",
 *   "review": {
 *     "strategyId": "strat-123",
 *     "strengths": [
 *       "Strong 62% win rate",
 *       "Excellent profit factor of 1.82",
 *       "Consistent Sharpe ratio of 1.45"
 *     ],
 *     "weaknesses": [
 *       "Average loss is 72% of average win",
 *       "Max drawdown of 12% is acceptable but notable"
 *     ],
 *     "improvements": [
 *       "Add entry filters to improve signal quality",
 *       "Optimize position sizing using Kelly Criterion",
 *       "Consider tighter stop losses in trending markets"
 *     ],
 *     "overallAssessment": "Good"
 *   }
 * }
 */
router.post('/strategy-review', optionalClaude, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const performance: StrategyPerformance = req.body

    if (!performance.strategyId || !performance.name || performance.totalTrades === undefined) {
      logger.warn({
        type: 'strategy_review_validation_failed',
        userId,
      })
      return res.status(400).json({
        error: 'Missing required fields: strategyId, name, totalTrades',
      })
    }

    logger.debug({
      type: 'strategy_review_starting',
      userId,
      strategyId: performance.strategyId,
    })

    const canUseClaude = (req as any).claudeAvailable === true
    let review = null

    if (canUseClaude) {
      try {
        review = await strategyReviewService.reviewStrategy(userId, performance)
      } catch (error: any) {
        logger.error({
          type: 'strategy_review_error',
          userId,
          error: error.message,
        })
      }
    }

    const response: any = {
      status: 'success',
      review,
    }

    if (review) {
      response.message = 'Strategy review complete'
    } else if (canUseClaude) {
      response.message = 'Strategy review failed. Try again later.'
    } else {
      response.message = 'Upgrade to premium for strategy review'
    }

    res.json(response)
  } catch (error: any) {
    logger.error({
      type: 'strategy_review_endpoint_error',
      userId: (req as any).user?.userId,
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to review strategy' })
  }
})

/**
 * POST /analytics/detect-anomaly
 *
 * Detect unusual patterns in price or trading activity
 *
 * Request:
 * {
 *   "type": "price",
 *   "symbol": "RELIANCE",
 *   "currentPrice": 3000,
 *   "historicalPrices": [
 *     { "timestamp": "...", "open": 2850, "high": 2900, "low": 2840, "close": 2880, "volume": 2300000 },
 *     ...
 *   ]
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "anomaly": {
 *     "isAnomaly": true,
 *     "type": "price_gap",
 *     "severity": "high",
 *     "confidence": 0.92,
 *     "explanation": "Price jumped 5% in single candle with 3x average volume",
 *     "recommendation": "investigate",
 *     "suggestedActions": [
 *       "Check recent news or events",
 *       "Verify order flow",
 *       "Review broker messages"
 *     ]
 *   }
 * }
 */
router.post('/detect-anomaly', optionalClaude, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { type, symbol, currentPrice, historicalPrices } = req.body

    if (!type || !symbol || currentPrice === undefined) {
      logger.warn({
        type: 'anomaly_validation_failed',
        userId,
      })
      return res.status(400).json({
        error: 'Missing required fields: type, symbol, currentPrice',
      })
    }

    logger.debug({
      type: 'anomaly_detection_starting',
      userId,
      symbol,
    })

    let anomaly = null

    if (type === 'price' && historicalPrices) {
      anomaly = await anomalyDetectionService.detectPriceAnomaly(userId, {
        symbol,
        currentPrice,
        historicalPrices,
        avgPrice: currentPrice,
        avgVolume: 0,
        volatility: 0,
      })
    } else if (type === 'portfolio') {
      anomaly = anomalyDetectionService.detectPortfolioAnomaly(req.body)
    }

    const response: any = {
      status: 'success',
      anomaly,
    }

    if (anomaly?.isAnomaly) {
      response.message = `${anomaly.severity.toUpperCase()} anomaly detected`
    } else {
      response.message = 'No anomalies detected'
    }

    res.json(response)
  } catch (error: any) {
    logger.error({
      type: 'anomaly_endpoint_error',
      userId: (req as any).user?.userId,
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to detect anomalies' })
  }
})

/**
 * POST /analytics/recommendations
 *
 * Get AI-powered optimization recommendations
 *
 * Request:
 * {
 *   "strategyName": "Golden Cross",
 *   "currentMetrics": {
 *     "winRate": 0.62,
 *     "profitFactor": 1.82,
 *     "sharpeRatio": 1.45,
 *     "maxDrawdown": -0.12
 *   },
 *   "portfolio": {
 *     "totalValue": 500000,
 *     "cashPercent": 0.15,
 *     "concentrationPercent": 0.25
 *   },
 *   "marketCondition": "bullish"
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "recommendations": [
 *     {
 *       "category": "strategy",
 *       "priority": "high",
 *       "title": "Improve Entry Signal Quality",
 *       "description": "Your win rate is 62%. Consider adding confirmation filters.",
 *       "expectedImprovement": "10-20% win rate increase",
 *       "implementationDifficulty": "medium",
 *       "estimatedTimeToImplement": "3-5 days",
 *       "riskLevel": "low"
 *     },
 *     ...
 *   ],
 *   "optimizationScore": 78
 * }
 */
router.post('/recommendations', optionalClaude, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const context: OptimizationContext = req.body

    if (!context.strategyName || !context.currentMetrics || !context.portfolio) {
      logger.warn({
        type: 'recommendations_validation_failed',
        userId,
      })
      return res.status(400).json({
        error: 'Missing required fields: strategyName, currentMetrics, portfolio',
      })
    }

    logger.debug({
      type: 'recommendations_starting',
      userId,
      strategy: context.strategyName,
    })

    const canUseClaude = (req as any).claudeAvailable === true
    let recommendations = []

    if (canUseClaude) {
      try {
        recommendations = await optimizationService.generateRecommendations(userId, context)
      } catch (error: any) {
        logger.error({
          type: 'recommendations_error',
          userId,
          error: error.message,
        })
      }
    }

    const optimizationScore = optimizationService.calculateOptimizationScore(context)

    const response: any = {
      status: 'success',
      recommendations,
      optimizationScore,
    }

    if (recommendations.length > 0) {
      response.message = `${recommendations.length} recommendations generated`
    } else if (canUseClaude) {
      response.message = 'Unable to generate recommendations. Try again later.'
    } else {
      response.message = 'Upgrade to premium for optimization recommendations'
    }

    res.json(response)
  } catch (error: any) {
    logger.error({
      type: 'recommendations_endpoint_error',
      userId: (req as any).user?.userId,
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to generate recommendations' })
  }
})

/**
 * POST /analytics/optimization-score
 *
 * Calculate strategy optimization score (0-100)
 *
 * Request: Same as /recommendations
 *
 * Response:
 * {
 *   "status": "success",
 *   "optimizationScore": 78,
 *   "interpretation": "Good - Most metrics are within acceptable ranges"
 * }
 */
router.post('/optimization-score', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const context: OptimizationContext = req.body

    if (!context.currentMetrics || !context.portfolio) {
      return res.status(400).json({
        error: 'Missing required fields: currentMetrics, portfolio',
      })
    }

    const score = optimizationService.calculateOptimizationScore(context)

    const interpretation =
      score >= 80
        ? 'Excellent - Strategy is well optimized'
        : score >= 60
          ? 'Good - Most metrics are within acceptable ranges'
          : score >= 40
            ? 'Fair - Several areas need improvement'
            : 'Needs improvement - Major optimization required'

    res.json({
      status: 'success',
      optimizationScore: score,
      interpretation,
    })
  } catch (error: any) {
    logger.error({
      type: 'optimization_score_error',
      userId: (req as any).user?.userId,
      error: error.message,
    })
    res.status(500).json({ error: 'Failed to calculate optimization score' })
  }
})

export default router
