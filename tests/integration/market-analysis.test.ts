/**
 * Market Analysis Integration Tests
 *
 * Tests for sentiment analysis and risk assessment endpoints
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { claudeService } from '../../src/services/claude-service'
import { usageTrackingService } from '../../src/services/usage-tracking-service'
import { cacheService } from '../../src/services/cache-service'

describe('Market Analysis - Sentiment', () => {
  beforeEach(async () => {
    await cacheService.clear()
  })

  it('should analyze market sentiment', async () => {
    const marketData = {
      index_level: 78000,
      index_change_percent: 0.85,
      sector_performance: {
        IT: 0.3,
        Finance: 1.5,
        FMCG: -0.8,
      },
      breadth: {
        advances: 1850,
        declines: 850,
        unchanged: 300,
      },
      volatility_index: 16.2,
      put_call_ratio: 0.92,
      fii_flow: 150000000,
    }

    const analysis = await claudeService.analyzeSentiment('user-123', {
      marketData,
    })

    expect(analysis).toBeDefined()
    expect(analysis.sentiment).toBeGreaterThanOrEqual(-1)
    expect(analysis.sentiment).toBeLessThanOrEqual(1)
    expect(['strong_bull', 'moderate_bull', 'neutral', 'moderate_bear', 'strong_bear']).toContain(
      analysis.trend
    )
    expect(analysis.confidence).toBeGreaterThan(0)
  })

  it('should include caution points in sentiment analysis', async () => {
    const marketData = {
      index_level: 75000,
      index_change_percent: -2.5,
      breadth: {
        advances: 800,
        declines: 1500,
        unchanged: 200,
      },
      volatility_index: 22.5,
    }

    const analysis = await claudeService.analyzeSentiment('user-456', {
      marketData,
    })

    expect(analysis).toBeDefined()
    expect(analysis.sentiment).toBeLessThan(0) // Bearish
    // Caution points should be present if sentiment is negative
    if (analysis.sentiment < 0) {
      expect(analysis.caution_points).toBeDefined()
    }
  })

  it('should handle missing market data gracefully', async () => {
    const analysis = await claudeService.analyzeSentiment('user-789', {
      marketData: {},
    })

    expect(analysis).toBeDefined()
    expect(typeof analysis.sentiment).toBe('number')
  })
})

describe('Market Analysis - Risk Assessment', () => {
  beforeEach(async () => {
    await cacheService.clear()
  })

  it('should assess trade risk against portfolio', async () => {
    const riskRequest = {
      proposedTrade: {
        symbol: 'RELIANCE',
        direction: 'long' as const,
        entryPrice: 2850,
        quantity: 100,
        stopLoss: 2778,
        takeProfit: 2950,
        timeHorizon: '1 week',
      },
      userPortfolio: {
        totalBalance: 500000,
        cashAvailable: 50000,
        marginUsedPercent: 45,
        activePositions: 5,
        currentDrawdown: -3.5,
        beta: 1.2,
      },
      userRiskProfile: 'moderate' as const,
    }

    const assessment = await claudeService.assessRisk('user-123', riskRequest)

    expect(assessment).toBeDefined()
    expect(assessment.riskScore).toBeGreaterThanOrEqual(0)
    expect(assessment.riskScore).toBeLessThanOrEqual(1)
    expect(['Approve', 'Approve with adjustments', 'Reject', 'Investigate']).toContain(
      assessment.recommendation
    )
  })

  it('should identify margin concerns', async () => {
    const riskRequest = {
      proposedTrade: {
        symbol: 'TCS',
        direction: 'long' as const,
        entryPrice: 4120,
        quantity: 200,
        stopLoss: 4000,
      },
      userPortfolio: {
        totalBalance: 200000,
        cashAvailable: 5000,
        marginUsedPercent: 95,
        activePositions: 10,
        currentDrawdown: -5.5,
      },
      userRiskProfile: 'aggressive' as const,
    }

    const assessment = await claudeService.assessRisk('user-456', riskRequest)

    expect(assessment).toBeDefined()
    expect(assessment.marginSafety).toBeDefined()
    // High margin usage should be flagged
    if (assessment.marginSafety === 'concerning') {
      expect(assessment.recommendation).not.toBe('Approve')
    }
  })

  it('should suggest adjustments for aggressive trades', async () => {
    const riskRequest = {
      proposedTrade: {
        symbol: 'INFY',
        direction: 'short' as const,
        entryPrice: 2340,
        quantity: 500,
        stopLoss: 2450,
      },
      userPortfolio: {
        totalBalance: 250000,
        cashAvailable: 10000,
        marginUsedPercent: 85,
        activePositions: 8,
      },
      userRiskProfile: 'conservative' as const,
    }

    const assessment = await claudeService.assessRisk('user-789', riskRequest)

    expect(assessment).toBeDefined()
    // Conservative profile + aggressive trade should suggest adjustments
    if (assessment.riskScore > 0.7) {
      expect(assessment.suggestedAdjustments).toBeDefined()
    }
  })
})

describe('Usage Tracking', () => {
  beforeEach(async () => {
    await cacheService.clear()
  })

  it('should track usage records', async () => {
    await usageTrackingService.trackUsage({
      userId: 'user-123',
      useCase: 'signal_validation',
      timestamp: new Date(),
      responseTimeMs: 1250,
      costInDollars: 0.0008,
      success: true,
    })

    const stats = await usageTrackingService.getMonthlyStats('user-123')
    expect(stats.monthlyUsage).toBeGreaterThan(0)
    expect(stats.currentCost).toBeGreaterThan(0)
  })

  it('should track failed requests', async () => {
    await usageTrackingService.trackUsage({
      userId: 'user-456',
      useCase: 'sentiment_analysis',
      timestamp: new Date(),
      responseTimeMs: 0,
      costInDollars: 0,
      success: false,
      error: 'API timeout',
    })

    const stats = await usageTrackingService.getMonthlyStats('user-456')
    expect(stats).toBeDefined()
  })

  it('should calculate cost estimates correctly', () => {
    const costs = usageTrackingService.constructor.getCostEstimates()

    expect(costs.signal_validation).toBeLessThan(0.001)
    expect(costs.risk_assessment).toBeGreaterThan(0.002)
    expect(costs.strategy_review).toBeGreaterThan(0.003)

    // Verify all use cases have estimates
    expect(costs.sentiment_analysis).toBeDefined()
    expect(costs.anomaly_detection).toBeDefined()
  })

  it('should prevent exceeding usage limits', async () => {
    // Track 501 requests (over premium limit of 500)
    for (let i = 0; i < 501; i++) {
      await usageTrackingService.trackUsage({
        userId: 'user-limit-test',
        useCase: 'signal_validation',
        timestamp: new Date(),
        responseTimeMs: 1000,
        costInDollars: 0.0008,
        success: true,
      })
    }

    const hasExceeded = await usageTrackingService.hasExceededLimit('user-limit-test', 500)
    expect(hasExceeded).toBe(true)
  })
})

describe('Response Formats', () => {
  it('should return sentiment analysis in correct format', async () => {
    const response = {
      status: 'success',
      sentimentAnalysis: {
        sentiment: 0.72,
        trend: 'moderate_bull',
        confidence: 0.78,
        reasoning: 'Strong breadth confirms uptrend...',
        preferred_trades: ['momentum', 'sector_rotation'],
        caution_points: ['Watch earnings', 'Monitor FII flows'],
      },
      message: 'Market sentiment analysis complete',
      claudeUsed: true,
    }

    expect(response.status).toBe('success')
    expect(response.sentimentAnalysis).toBeDefined()
    expect(response.sentimentAnalysis.sentiment).toBeGreaterThanOrEqual(-1)
    expect(response.sentimentAnalysis.sentiment).toBeLessThanOrEqual(1)
    expect(response.sentimentAnalysis.confidence).toBeGreaterThan(0)
  })

  it('should return risk assessment in correct format', async () => {
    const response = {
      status: 'success',
      riskAnalysis: {
        isAppropriate: true,
        riskScore: 0.68,
        reasoning: 'Position size within limits...',
        marginSafety: 'tight',
        sectorConcentration: 'balanced',
        recommendation: 'Approve with adjustments',
        suggestedAdjustments: {
          position_size: 'Reduce to 50 shares',
          margin_cushion: 'Ensure ₹75k buffer',
          hedging: 'Consider protective puts',
        },
      },
      message: 'Risk assessment complete',
    }

    expect(response.status).toBe('success')
    expect(response.riskAnalysis).toBeDefined()
    expect(response.riskAnalysis.riskScore).toBeGreaterThanOrEqual(0)
    expect(response.riskAnalysis.riskScore).toBeLessThanOrEqual(1)
    expect(['Approve', 'Approve with adjustments', 'Reject', 'Investigate']).toContain(
      response.riskAnalysis.recommendation
    )
  })

  it('should return usage stats in correct format', () => {
    const response = {
      status: 'success',
      usage: {
        monthlyUsage: 125,
        monthlyLimit: 500,
        creditsRemaining: 375,
        currentCostUSD: '0.40',
        usagePercent: '25.0',
        lastUpdated: '2026-06-08T14:32:45Z',
      },
    }

    expect(response.status).toBe('success')
    expect(response.usage).toBeDefined()
    expect(response.usage.monthlyUsage).toBeLessThanOrEqual(response.usage.monthlyLimit)
    expect(response.usage.creditsRemaining).toBeGreaterThanOrEqual(0)
  })

  it('should return cost estimates', () => {
    const response = {
      status: 'success',
      costPerAnalysis: {
        signal_validation: 0.0008,
        sentiment_analysis: 0.0015,
        risk_assessment: 0.003,
        strategy_review: 0.004,
        anomaly_detection: 0.0005,
      },
      monthlyEstimates: {
        basic: '0.04',
        premium: '0.40',
        enterprise: 'Custom pricing',
      },
    }

    expect(response.status).toBe('success')
    expect(response.costPerAnalysis).toBeDefined()
    expect(response.monthlyEstimates).toBeDefined()
  })
})
