// @ts-nocheck
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
  const requestId = `analytics-review-${Date.now()}`
  const startTime = Date.now()

  try {
    const userId = req.user?.userId
    const ipAddress = (req as any).ip

    // LOG: Entry point
    logger.debug('Analytics', 'Strategy review request received', {
      requestId,
      userId,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    if (!userId) {
      const duration = Date.now() - startTime
      logger.warn('Analytics', 'Strategy review failed - user not authenticated', {
        requestId,
        reason: 'not_authenticated',
        durationMs: duration,
      })
      return res.status(401).json({
        error: 'Unauthorized',
        reason: 'not_authenticated',
      })
    }

    const performance: StrategyPerformance = req.body

    // LOG: Input validation
    logger.debug('Analytics', 'Validating strategy performance data', {
      requestId,
      userId,
      hasStrategyId: !!performance.strategyId,
      hasName: !!performance.name,
      hasTotalTrades: performance.totalTrades !== undefined,
    })

    if (!performance.strategyId || !performance.name || performance.totalTrades === undefined) {
      const duration = Date.now() - startTime
      logger.warn('Analytics', 'Strategy review validation failed - missing fields', {
        requestId,
        userId,
        missingFields: {
          strategyId: !performance.strategyId,
          name: !performance.name,
          totalTrades: performance.totalTrades === undefined,
        },
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Missing required fields: strategyId, name, totalTrades',
        reason: 'missing_fields',
      })
    }

    logger.debug('Analytics', 'Strategy data validated, starting review analysis', {
      requestId,
      userId,
      strategyId: performance.strategyId,
      strategyName: performance.name,
      metrics: {
        totalTrades: performance.totalTrades,
        winningTrades: performance.winningTrades,
        losingTrades: performance.losingTrades,
        profitFactor: performance.profitFactor,
        sharpeRatio: performance.sharpeRatio,
        maxDrawdown: performance.maxDrawdown,
      },
      periodStart: performance.periodStart,
      periodEnd: performance.periodEnd,
    })

    const canUseClaude = (req as any).claudeAvailable === true
    let review = null
    let reviewDuration = 0

    if (canUseClaude) {
      logger.debug('Analytics', 'Sending strategy for AI review analysis', {
        requestId,
        userId,
        strategyId: performance.strategyId,
        aiProvider: 'claude',
      })

      try {
        const reviewStart = Date.now()
        review = await strategyReviewService.reviewStrategy(userId, performance)
        reviewDuration = Date.now() - reviewStart

        logger.debug('Analytics', 'AI strategy review completed', {
          requestId,
          userId,
          strategyId: performance.strategyId,
          reviewDurationMs: reviewDuration,
          hasReview: !!review,
        })
      } catch (error: any) {
        reviewDuration = Date.now() - startTime
        logger.warn('Analytics', `Strategy review analysis failed: ${error.message}`, {
          requestId,
          userId,
          strategyId: performance.strategyId,
          errorMessage: error.message,
          durationMs: reviewDuration,
        })
      }
    } else {
      logger.debug('Analytics', 'Claude not available, basic review only', {
        requestId,
        userId,
        strategyId: performance.strategyId,
      })
    }

    const totalDuration = Date.now() - startTime

    // LOG: Success
    if (review) {
      logger.info('Analytics', 'Strategy review completed successfully', {
        requestId,
        userId,
        strategyId: performance.strategyId,
        strategyName: performance.name,
        totalTrades: performance.totalTrades,
        profitFactor: performance.profitFactor,
        reviewAvailable: true,
        strengths: review.strengths?.length || 0,
        weaknesses: review.weaknesses?.length || 0,
        improvements: review.improvements?.length || 0,
        overallAssessment: review.overallAssessment,
        reviewDurationMs: reviewDuration,
        totalDurationMs: totalDuration,
        ipAddress,
        timestamp: new Date().toISOString(),
      })
    } else {
      logger.info('Analytics', 'Strategy review request processed (no AI analysis)', {
        requestId,
        userId,
        strategyId: performance.strategyId,
        strategyName: performance.name,
        reason: canUseClaude ? 'ai_error' : 'not_premium',
        totalDurationMs: totalDuration,
        ipAddress,
        timestamp: new Date().toISOString(),
      })
    }

    const response: any = {
      status: 'success',
      review,
      requestId,
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
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Analytics', `Strategy review endpoint error: ${errorMessage}`, error, {
      requestId,
      userId: req.user?.userId,
      strategyId: req.body?.strategyId,
      errorMessage,
      durationMs: duration,
      ipAddress: (req as any).ip,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      error: 'Failed to review strategy',
      reason: 'server_error',
      requestId,
    })
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
  const requestId = `analytics-score-${Date.now()}`
  const startTime = Date.now()

  try {
    const userId = req.user?.userId
    const ipAddress = (req as any).ip

    // LOG: Entry point
    logger.debug('Analytics', 'Optimization score calculation request received', {
      requestId,
      userId,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    if (!userId) {
      const duration = Date.now() - startTime
      logger.warn('Analytics', 'Optimization score failed - user not authenticated', {
        requestId,
        reason: 'not_authenticated',
        durationMs: duration,
      })
      return res.status(401).json({
        error: 'Unauthorized',
        reason: 'not_authenticated',
      })
    }

    const context: OptimizationContext = req.body

    // LOG: Input validation
    logger.debug('Analytics', 'Validating optimization context', {
      requestId,
      userId,
      hasCurrentMetrics: !!context.currentMetrics,
      hasPortfolio: !!context.portfolio,
      strategyName: context.strategyName,
    })

    if (!context.currentMetrics || !context.portfolio) {
      const duration = Date.now() - startTime
      logger.warn('Analytics', 'Optimization score validation failed - missing fields', {
        requestId,
        userId,
        missingFields: {
          currentMetrics: !context.currentMetrics,
          portfolio: !context.portfolio,
        },
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Missing required fields: currentMetrics, portfolio',
        reason: 'missing_fields',
      })
    }

    // LOG: Calculation starting
    logger.debug('Analytics', 'Starting optimization score calculation', {
      requestId,
      userId,
      metrics: {
        winRate: context.currentMetrics.winRate,
        profitFactor: context.currentMetrics.profitFactor,
        sharpeRatio: context.currentMetrics.sharpeRatio,
        maxDrawdown: context.currentMetrics.maxDrawdown,
      },
      portfolio: {
        totalValue: context.portfolio.totalValue,
        cashPercent: context.portfolio.cashPercent,
        concentrationPercent: context.portfolio.concentrationPercent,
      },
    })

    // Calculate score
    const calcStart = Date.now()
    const score = optimizationService.calculateOptimizationScore(context)
    const calcDuration = Date.now() - calcStart

    const interpretation =
      score >= 80
        ? 'Excellent - Strategy is well optimized'
        : score >= 60
          ? 'Good - Most metrics are within acceptable ranges'
          : score >= 40
            ? 'Fair - Several areas need improvement'
            : 'Needs improvement - Major optimization required'

    const totalDuration = Date.now() - startTime

    // LOG: Success
    logger.info('Analytics', 'Optimization score calculated successfully', {
      requestId,
      userId,
      strategyName: context.strategyName,
      optimizationScore: score,
      scoreInterpretation: interpretation,
      winRate: context.currentMetrics.winRate,
      profitFactor: context.currentMetrics.profitFactor,
      sharpeRatio: context.currentMetrics.sharpeRatio,
      portfolioValue: context.portfolio.totalValue,
      calcDurationMs: calcDuration,
      totalDurationMs: totalDuration,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    res.json({
      status: 'success',
      optimizationScore: score,
      interpretation,
      requestId,
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Analytics', `Optimization score calculation failed: ${errorMessage}`, error, {
      requestId,
      userId: req.user?.userId,
      errorMessage,
      durationMs: duration,
      ipAddress: (req as any).ip,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      error: 'Failed to calculate optimization score',
      reason: 'server_error',
      requestId,
    })
  }
})

export default router
