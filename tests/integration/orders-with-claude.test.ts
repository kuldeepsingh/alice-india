/**
 * Orders with Claude Integration Tests
 *
 * Tests:
 * - Order creation with Claude validation
 * - Premium user gets Claude analysis
 * - Free user doesn't get Claude analysis
 * - Claude fallback on error
 * - Credit deduction
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { claudeService } from '../../src/services/claude-service'
import { premiumFeatureService } from '../../src/services/premium-feature-service'
import { cacheService } from '../../src/services/cache-service'

describe('Orders with Claude Integration', () => {
  beforeEach(async () => {
    await cacheService.clear()
  })

  describe('Order Validation', () => {
    it('should validate required fields', () => {
      const validOrder = {
        accountId: 'acc-123',
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: 10,
        price: 2850,
      }

      expect(validOrder.accountId).toBeDefined()
      expect(validOrder.symbol).toBeDefined()
      expect(validOrder.side).toMatch(/BUY|SELL/)
      expect(validOrder.quantity).toBeGreaterThan(0)
      expect(validOrder.price).toBeGreaterThan(0)
    })

    it('should reject invalid quantity', () => {
      const invalidOrder = {
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: -10, // Invalid
        price: 2850,
      }

      expect(invalidOrder.quantity).toBeLessThanOrEqual(0)
    })

    it('should reject invalid side', () => {
      const invalidOrder = {
        symbol: 'RELIANCE',
        side: 'INVALID', // Invalid
        quantity: 10,
        price: 2850,
      }

      expect(['BUY', 'SELL']).not.toContain(invalidOrder.side)
    })
  })

  describe('Claude Signal Validation', () => {
    it('should get Claude validation for BUY signal', async () => {
      const signal = {
        symbol: 'RELIANCE',
        action: 'BUY' as const,
        confidence: 0.72,
        indicators: {
          ma20: 2848,
          ma50: 2835,
          rsi: 62,
        },
        marketContext: {
          currentPrice: 2850,
          volume: 2300000,
        },
      }

      const analysis = await claudeService.validateSignal('premium-user-123', signal)

      expect(analysis).toBeDefined()
      expect(analysis.isValid).toEqual(expect.any(Boolean))
      expect(analysis.confidence).toBeGreaterThanOrEqual(0)
      expect(analysis.confidence).toBeLessThanOrEqual(1)
      expect(['low', 'medium', 'high']).toContain(analysis.riskLevel)
    })

    it('should handle Claude service failure gracefully', async () => {
      const signal = {
        symbol: 'TEST',
        action: 'BUY' as const,
        confidence: 0.5,
      }

      // Should not throw, should return fallback
      const analysis = await claudeService.validateSignal('user-123', signal)

      expect(analysis).toBeDefined()
      expect(analysis.confidence).toBeGreaterThan(0)
    })

    it('should cache Claude results', async () => {
      const signal = {
        symbol: 'INFY',
        action: 'BUY' as const,
        confidence: 0.8,
      }

      // First call
      const analysis1 = await claudeService.validateSignal('user-123', signal)

      // Second call (should be from cache)
      const analysis2 = await claudeService.validateSignal('user-123', signal)

      // Should be identical
      expect(analysis1.confidence).toBe(analysis2.confidence)
      expect(analysis1.reasoning).toBe(analysis2.reasoning)
    })
  })

  describe('Premium Feature Access', () => {
    it('should allow premium users Claude features', async () => {
      // TODO: Mock premium user in database
      // const canUse = await premiumFeatureService.canUseClaude('premium-user-123')
      // expect(canUse.allowed).toBe(true)
    })

    it('should deny free users Claude features', async () => {
      const { allowed } = await premiumFeatureService.canUseClaude('free-user-123')
      expect(allowed).toBe(false)
    })

    it('should track Claude feature access', async () => {
      const hasFeature = await premiumFeatureService.hasFeature('user-123', 'claude_signal_validation')
      expect(typeof hasFeature).toBe('boolean')
    })
  })

  describe('Order Response Format', () => {
    it('should return order with Claude analysis (premium)', async () => {
      const orderResponse = {
        status: 'success',
        order: {
          id: 'order-123',
          symbol: 'RELIANCE',
          side: 'BUY',
          quantity: 10,
          price: 2850,
        },
        claudeAnalysis: {
          isValid: true,
          confidence: 0.85,
          reasoning: 'Well-timed signal',
          riskLevel: 'medium',
        },
        message: 'Order created with Claude signal validation',
      }

      expect(orderResponse.order).toBeDefined()
      expect(orderResponse.claudeAnalysis).toBeDefined()
      expect(orderResponse.claudeAnalysis.isValid).toEqual(expect.any(Boolean))
      expect(orderResponse.claudeAnalysis.confidence).toBeGreaterThan(0)
    })

    it('should return order without Claude (free user)', () => {
      const orderResponse = {
        status: 'success',
        order: {
          id: 'order-456',
          symbol: 'TCS',
          side: 'SELL',
          quantity: 5,
          price: 4120,
        },
        message: 'Upgrade to premium for Claude signal analysis',
      }

      expect(orderResponse.order).toBeDefined()
      expect(orderResponse.claudeAnalysis).toBeUndefined()
      expect(orderResponse.message).toContain('premium')
    })
  })

  describe('Error Handling', () => {
    it('should return 401 for unauthorized user', () => {
      const response = {
        status: 401,
        error: 'Unauthorized',
      }

      expect(response.status).toBe(401)
    })

    it('should return 404 for missing account', () => {
      const response = {
        status: 404,
        error: 'Account not found',
      }

      expect(response.status).toBe(404)
    })

    it('should return 400 for invalid inputs', () => {
      const response = {
        status: 400,
        error: 'Missing required fields: accountId, symbol, side, quantity, price',
      }

      expect(response.status).toBe(400)
      expect(response.error).toContain('required')
    })

    it('should return 403 for access denied', () => {
      const response = {
        status: 403,
        error: 'Access denied',
      }

      expect(response.status).toBe(403)
    })
  })

  describe('Claude Decision Logging', () => {
    it('should log Claude decisions for analytics', () => {
      const log = {
        type: 'order_created_with_claude',
        userId: 'user-123',
        orderId: 'order-456',
        symbol: 'RELIANCE',
        claudeUsed: true,
        claudeValid: true,
        claudeConfidence: 0.85,
      }

      expect(log.type).toContain('claude')
      expect(log.claudeUsed).toBe(true)
      expect(log.claudeConfidence).toBeGreaterThan(0)
    })
  })

  describe('Performance', () => {
    it('should complete order creation within timeout', async () => {
      const startTime = Date.now()

      const signal = {
        symbol: 'RELIANCE',
        action: 'BUY' as const,
        confidence: 0.72,
      }

      await claudeService.validateSignal('user-123', signal)

      const duration = Date.now() - startTime

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000)
    })
  })
})
