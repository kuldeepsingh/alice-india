/**
 * Advanced Analytics Integration Tests
 *
 * Tests for strategy review, anomaly detection, and recommendations
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { strategyReviewService } from '../../src/services/strategy-review-service'
import { anomalyDetectionService } from '../../src/services/anomaly-detection-service'
import { optimizationService } from '../../src/services/optimization-service'
import { cacheService } from '../../src/services/cache-service'

describe('Advanced Analytics', () => {
  beforeEach(async () => {
    await cacheService.clear()
  })

  describe('Strategy Review', () => {
    it('should review strategy performance', async () => {
      const performance = {
        strategyId: 'strat-123',
        name: 'Golden Cross',
        totalTrades: 45,
        winningTrades: 28,
        losingTrades: 17,
        avgWin: 2500,
        avgLoss: 1800,
        winRate: 0.62,
        profitFactor: 1.82,
        maxDrawdown: -0.12,
        sharpeRatio: 1.45,
        maxConsecutiveLosses: 3,
        totalReturn: 45000,
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-06-08'),
      }

      const review = await strategyReviewService.reviewStrategy('user-123', performance)

      expect(review).toBeDefined()
      expect(review.strategyId).toBe('strat-123')
      expect(review.strengths).toBeInstanceOf(Array)
      expect(review.weaknesses).toBeInstanceOf(Array)
      expect(review.improvements).toBeInstanceOf(Array)
      expect(['Excellent', 'Good', 'Fair', 'Needs improvement']).toContain(
        review.overallAssessment
      )
    })

    it('should identify strategy strengths', () => {
      const performance = {
        strategyId: 'strat-456',
        name: 'Momentum',
        totalTrades: 100,
        winningTrades: 75,
        losingTrades: 25,
        avgWin: 5000,
        avgLoss: 2000,
        winRate: 0.75,
        profitFactor: 3.75,
        maxDrawdown: -0.08,
        sharpeRatio: 2.5,
        maxConsecutiveLosses: 2,
        totalReturn: 350000,
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-06-08'),
      }

      expect(performance.winRate).toBeGreaterThan(0.6)
      expect(performance.profitFactor).toBeGreaterThan(3)
      expect(performance.sharpeRatio).toBeGreaterThan(2)
    })

    it('should calculate performance metrics', () => {
      const trades = [
        { pnl: 2500, quantity: 100, entryPrice: 25 },
        { pnl: 3000, quantity: 100, entryPrice: 30 },
        { pnl: -1500, quantity: 100, entryPrice: 25 },
        { pnl: 2800, quantity: 100, entryPrice: 28 },
        { pnl: -1200, quantity: 100, entryPrice: 24 },
      ]

      const metrics = strategyReviewService.constructor.calculateMetrics(trades)

      expect(metrics.totalTrades).toBe(5)
      expect(metrics.winRate).toBeGreaterThan(0.5)
      expect(metrics.profitFactor).toBeGreaterThan(1)
    })
  })

  describe('Anomaly Detection', () => {
    it('should detect price anomalies', async () => {
      const priceData = {
        symbol: 'RELIANCE',
        currentPrice: 3500,
        historicalPrices: [
          { timestamp: new Date(), open: 2800, high: 2850, low: 2790, close: 2820, volume: 2300000 },
          { timestamp: new Date(), open: 2820, high: 2880, low: 2815, close: 2870, volume: 2400000 },
          { timestamp: new Date(), open: 2870, high: 2900, low: 2860, close: 2890, volume: 2350000 },
        ],
        avgPrice: 2860,
        avgVolume: 2350000,
        volatility: 0.5,
      }

      const anomaly = await anomalyDetectionService.detectPriceAnomaly('user-123', priceData)

      expect(anomaly).toBeDefined()
      expect(typeof anomaly.isAnomaly).toBe('boolean')
      expect(anomaly.severity).toMatch(/low|medium|high/)
      expect(anomaly.confidence).toBeGreaterThanOrEqual(0)
      expect(anomaly.confidence).toBeLessThanOrEqual(1)
    })

    it('should detect trading anomalies', async () => {
      const trades = [
        { quantity: 100, price: 2850, symbol: 'RELIANCE' },
        { quantity: 95, price: 2855, symbol: 'RELIANCE' },
        { quantity: 500, price: 2848, symbol: 'RELIANCE' }, // Outlier
        { quantity: 105, price: 2860, symbol: 'RELIANCE' },
        { quantity: 98, price: 2852, symbol: 'RELIANCE' },
      ]

      const anomaly = await anomalyDetectionService.detectTradingAnomaly('user-456', trades)

      expect(anomaly).toBeDefined()
      expect(typeof anomaly.isAnomaly).toBe('boolean')
      expect(anomaly.recommendation).toMatch(/investigate|ignore|alert|caution/)
    })

    it('should detect portfolio anomalies', () => {
      const portfolio = {
        positions: {
          RELIANCE: { value: 250000 },
          INFY: { value: 100000 },
          TCS: { value: 50000 },
          OTHER: { value: 100000 },
        },
        currentDrawdown: -0.05,
      }

      const anomaly = anomalyDetectionService.detectPortfolioAnomaly(portfolio)

      expect(anomaly).toBeDefined()
      if (anomaly.isAnomaly) {
        expect(anomaly.recommendation).toBe('alert')
      }
    })

    it('should handle highly concentrated portfolios', () => {
      const portfolio = {
        positions: {
          RELIANCE: { value: 450000 },
          OTHER: { value: 50000 },
        },
        currentDrawdown: -0.02,
      }

      const anomaly = anomalyDetectionService.detectPortfolioAnomaly(portfolio)

      expect(anomaly.isAnomaly).toBe(true)
      expect(anomaly.severity).toBe('high')
      expect(anomaly.recommendation).toBe('alert')
    })
  })

  describe('Optimization Recommendations', () => {
    it('should generate optimization recommendations', async () => {
      const context = {
        strategyName: 'Golden Cross',
        currentMetrics: {
          winRate: 0.55,
          profitFactor: 1.2,
          sharpeRatio: 0.8,
          maxDrawdown: -0.25,
        },
        portfolio: {
          totalValue: 500000,
          cashPercent: 0.05,
          concentrationPercent: 0.35,
        },
        marketCondition: 'bullish' as const,
      }

      const recommendations = await optimizationService.generateRecommendations(
        'user-123',
        context
      )

      expect(recommendations).toBeInstanceOf(Array)
      expect(recommendations.length).toBeGreaterThan(0)

      // Each recommendation should have required fields
      for (const rec of recommendations) {
        expect(rec.category).toBeDefined()
        expect(rec.priority).toMatch(/high|medium|low/)
        expect(rec.title).toBeDefined()
        expect(rec.description).toBeDefined()
        expect(rec.implementationDifficulty).toMatch(/easy|medium|hard/)
      }
    })

    it('should prioritize high-priority recommendations', async () => {
      const context = {
        strategyName: 'Poor Strategy',
        currentMetrics: {
          winRate: 0.35, // Low win rate
          profitFactor: 0.8, // Losing money
          sharpeRatio: -1.0, // Negative Sharpe
          maxDrawdown: -0.45, // High drawdown
        },
        portfolio: {
          totalValue: 500000,
          cashPercent: 0.02,
          concentrationPercent: 0.60, // Highly concentrated
        },
        marketCondition: 'bearish' as const,
      }

      const recommendations = await optimizationService.generateRecommendations(
        'user-456',
        context
      )

      const highPriority = recommendations.filter(r => r.priority === 'high')
      expect(highPriority.length).toBeGreaterThan(0)
    })

    it('should calculate optimization score correctly', () => {
      const excellentContext = {
        strategyName: 'Excellent Strategy',
        currentMetrics: {
          winRate: 0.70,
          profitFactor: 2.5,
          sharpeRatio: 2.0,
          maxDrawdown: -0.08,
        },
        portfolio: {
          totalValue: 500000,
          cashPercent: 0.15,
          concentrationPercent: 0.20,
        },
        marketCondition: 'bullish' as const,
      }

      const score = optimizationService.calculateOptimizationScore(excellentContext)
      expect(score).toBeGreaterThan(80)
    })

    it('should identify poorly optimized strategies', () => {
      const poorContext = {
        strategyName: 'Poor Strategy',
        currentMetrics: {
          winRate: 0.40,
          profitFactor: 0.8,
          sharpeRatio: -0.5,
          maxDrawdown: -0.40,
        },
        portfolio: {
          totalValue: 500000,
          cashPercent: 0.02,
          concentrationPercent: 0.70,
        },
        marketCondition: 'bearish' as const,
      }

      const score = optimizationService.calculateOptimizationScore(poorContext)
      expect(score).toBeLessThan(50)
    })
  })

  describe('Response Formats', () => {
    it('should return strategy review in correct format', async () => {
      const response = {
        status: 'success',
        review: {
          strategyId: 'strat-123',
          strengths: ['Strong metrics'],
          weaknesses: ['High drawdown'],
          improvements: ['Add filters'],
          riskAdjustments: ['Tighter stops'],
          marketAdaptations: 'Adjust for conditions',
          overallAssessment: 'Good' as const,
          nextActions: ['Test changes'],
        },
      }

      expect(response.status).toBe('success')
      expect(response.review).toBeDefined()
      expect(response.review.strengths).toBeInstanceOf(Array)
      expect(response.review.improvements).toBeInstanceOf(Array)
    })

    it('should return anomaly detection in correct format', async () => {
      const response = {
        status: 'success',
        anomaly: {
          isAnomaly: true,
          type: 'price_gap' as const,
          severity: 'high' as const,
          confidence: 0.92,
          explanation: 'Price jumped significantly',
          recommendation: 'investigate' as const,
          suggestedActions: ['Check news', 'Verify data'],
        },
      }

      expect(response.status).toBe('success')
      expect(response.anomaly).toBeDefined()
      expect(typeof response.anomaly.isAnomaly).toBe('boolean')
      expect(response.anomaly.severity).toMatch(/low|medium|high/)
    })

    it('should return recommendations in correct format', async () => {
      const response = {
        status: 'success',
        recommendations: [
          {
            category: 'strategy' as const,
            priority: 'high' as const,
            title: 'Improve Entry Signal Quality',
            description: 'Your win rate is low...',
            expectedImprovement: '10-20% improvement',
            implementationDifficulty: 'medium' as const,
            estimatedTimeToImplement: '3-5 days',
            riskLevel: 'low' as const,
          },
        ],
        optimizationScore: 65,
      }

      expect(response.status).toBe('success')
      expect(response.recommendations).toBeInstanceOf(Array)
      expect(response.optimizationScore).toBeGreaterThanOrEqual(0)
      expect(response.optimizationScore).toBeLessThanOrEqual(100)
    })
  })
})
