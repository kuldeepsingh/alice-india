/**
 * Claude Service Unit Tests
 *
 * Tests core functionality:
 * - Signal validation
 * - Error handling
 * - Caching
 * - Fallback mechanisms
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { claudeService } from '../../src/services/claude-service'
import { cacheService } from '../../src/services/cache-service'
import type { SignalValidationRequest } from '../../src/models/claude'

describe('Claude Service', () => {
  beforeEach(async () => {
    // Clear cache before each test
    await cacheService.clear()
  })

  describe('Signal Validation', () => {
    it('should validate a BUY signal', async () => {
      const request: SignalValidationRequest = {
        symbol: 'RELIANCE',
        action: 'BUY',
        confidence: 0.72,
        indicators: {
          ma20: 2848,
          ma50: 2835,
          rsi: 62,
          macd: 15,
        },
        marketContext: {
          currentPrice: 2850,
          high24h: 2890,
          low24h: 2810,
          volume: 2300000,
          volatility: 18,
        },
      }

      const response = await claudeService.validateSignal('user-123', request)

      expect(response).toBeDefined()
      expect(response.confidence).toBeGreaterThanOrEqual(0)
      expect(response.confidence).toBeLessThanOrEqual(1)
      expect(['low', 'medium', 'high']).toContain(response.riskLevel)
    })

    it('should return fallback on error', async () => {
      const request: SignalValidationRequest = {
        symbol: 'INVALID',
        action: 'BUY',
        confidence: 0.5,
      }

      // Should not throw, should return fallback
      const response = await claudeService.validateSignal('user-123', request)

      expect(response).toBeDefined()
      expect(response.confidence).toBeGreaterThan(0)
      expect(response.riskLevel).toEqual('medium')
    })

    it('should cache results for same symbol', async () => {
      const request: SignalValidationRequest = {
        symbol: 'INFY',
        action: 'BUY',
        confidence: 0.8,
      }

      // First call
      const response1 = await claudeService.validateSignal('user-123', request)

      // Second call should hit cache
      const response2 = await claudeService.validateSignal('user-123', request)

      // Responses should be identical (from cache)
      expect(response1).toEqual(response2)
    })
  })

  describe('Sentiment Analysis', () => {
    it('should analyze market sentiment', async () => {
      const request = {
        marketData: {
          index_level: 78000,
          index_change_percent: 0.85,
          breadth: {
            advances: 1850,
            declines: 850,
            unchanged: 300,
          },
          volatility_index: 16.2,
        },
      }

      const response = await claudeService.analyzeSentiment('user-123', request)

      expect(response).toBeDefined()
      expect(response.sentiment).toBeGreaterThanOrEqual(-1)
      expect(response.sentiment).toBeLessThanOrEqual(1)
      expect(['strong_bull', 'moderate_bull', 'neutral', 'moderate_bear', 'strong_bear']).toContain(response.trend)
    })
  })

  describe('Risk Assessment', () => {
    it('should assess trade risk against portfolio', async () => {
      const request = {
        proposedTrade: {
          symbol: 'RELIANCE',
          direction: 'long' as const,
          entryPrice: 2850,
          quantity: 100,
          stopLoss: 2778,
        },
        userPortfolio: {
          totalBalance: 500000,
          cashAvailable: 50000,
          marginUsedPercent: 45,
          activePositions: 5,
          currentDrawdown: -3.5,
        },
        userRiskProfile: 'moderate' as const,
      }

      const response = await claudeService.assessRisk('user-123', request)

      expect(response).toBeDefined()
      expect(response.riskScore).toBeGreaterThanOrEqual(0)
      expect(response.riskScore).toBeLessThanOrEqual(1)
      expect(['Approve', 'Approve with adjustments', 'Reject', 'Investigate']).toContain(response.recommendation)
    })
  })

  describe('Service Stats', () => {
    it('should return service statistics', () => {
      const stats = claudeService.getStats()

      expect(stats).toBeDefined()
      expect(stats.totalRequests).toBeGreaterThanOrEqual(0)
      expect(stats.totalCostUSD).toBeDefined()
      expect(stats.cacheStats).toBeDefined()
    })
  })
})
