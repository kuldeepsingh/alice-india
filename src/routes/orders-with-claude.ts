/**
 * Orders Route with Claude Integration
 *
 * Enhanced order creation endpoint that:
 * 1. Validates order inputs
 * 2. Checks if user is premium
 * 3. Gets Claude signal validation (if premium)
 * 4. Deducts credits (if used)
 * 5. Logs Claude decision
 * 6. Returns order with Claude insights
 *
 * Usage:
 *   POST /api/v1/orders/create-with-claude
 *   Body: {
 *     accountId, symbol, side, quantity, price,
 *     confidence?, indicators?, marketContext?
 *   }
 *
 * Response (Premium User):
 *   {
 *     order: { id, symbol, side, quantity, ... },
 *     claudeAnalysis: {
 *       isValid: true,
 *       confidence: 0.85,
 *       reasoning: "...",
 *       riskLevel: "medium"
 *     }
 *   }
 *
 * Response (Free User):
 *   {
 *     order: { id, symbol, side, quantity, ... },
 *     claudeAnalysis: null,
 *     message: "Upgrade to premium for Claude analysis"
 *   }
 */

import { Router } from 'express'
import { OrderService } from '../services/order-service.ts'
import { accountService } from '../services/account-service.ts'
import { claudeService } from '../services/claude-service.ts'
import { premiumFeatureService } from '../services/premium-feature-service.ts'
import { authMiddleware, AuthRequest } from '../middleware/auth.ts'
import { optionalClaude } from '../middleware/premium-only.ts'
import { logger } from '../services/logger.ts'
import type { SignalValidationRequest, SignalValidationResponse } from '../models/claude'

const router = Router()
const orderService = new OrderService()

// All routes require authentication
router.use(authMiddleware)

/**
 * POST /orders/create-with-claude
 *
 * Create order with optional Claude signal validation for premium users
 */
router.post('/create-with-claude', optionalClaude, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // ===== INPUT VALIDATION =====
    const { accountId, symbol, side, quantity, price, confidence = 0.5, indicators, marketContext } = req.body

    // Validate required fields
    if (!accountId || !symbol || !side || quantity === undefined || price === undefined) {
      logger.warn({
        type: 'order_validation_failed',
        reason: 'missing_required_fields',
        userId,
        fields: { accountId, symbol, side, quantity, price },
      })
      return res.status(400).json({
        error: 'Missing required fields: accountId, symbol, side, quantity, price',
      })
    }

    // Validate side
    if (!['BUY', 'SELL'].includes(side)) {
      logger.warn({
        type: 'order_validation_failed',
        reason: 'invalid_side',
        userId,
        side,
      })
      return res.status(400).json({ error: 'Invalid side. Must be BUY or SELL' })
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity <= 0) {
      logger.warn({
        type: 'order_validation_failed',
        reason: 'invalid_quantity',
        userId,
        quantity,
      })
      return res.status(400).json({ error: 'Quantity must be a positive number' })
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      logger.warn({
        type: 'order_validation_failed',
        reason: 'invalid_price',
        userId,
        price,
      })
      return res.status(400).json({ error: 'Price must be a positive number' })
    }

    // Validate symbol
    if (typeof symbol !== 'string' || symbol.trim().length === 0) {
      logger.warn({
        type: 'order_validation_failed',
        reason: 'invalid_symbol',
        userId,
        symbol,
      })
      return res.status(400).json({ error: 'Symbol cannot be empty' })
    }

    logger.debug({
      type: 'order_validation_passed',
      userId,
      symbol,
      side,
      quantity,
      price,
    })

    // ===== ACCOUNT VERIFICATION =====
    const account = await accountService.getAccountById(accountId)
    if (!account) {
      logger.error({
        type: 'account_not_found',
        userId,
        accountId,
      })
      return res.status(404).json({ error: 'Account not found' })
    }

    if (account.userId !== userId) {
      logger.warn({
        type: 'account_access_denied',
        userId,
        accountId,
      })
      return res.status(403).json({ error: 'Access denied' })
    }

    logger.debug({
      type: 'account_verified',
      userId,
      accountId,
      balance: account.balance,
    })

    // ===== CLAUDE SIGNAL VALIDATION (IF PREMIUM) =====
    let claudeAnalysis: SignalValidationResponse | null = null
    let claudeWasUsed = false

    const canUseClaude = (req as any).claudeAvailable === true

    if (canUseClaude) {
      try {
        logger.debug({
          type: 'claude_validation_starting',
          userId,
          symbol,
          side,
        })

        // Build Claude request
        const claudeRequest: SignalValidationRequest = {
          symbol,
          action: side as 'BUY' | 'SELL',
          confidence,
          indicators,
          marketContext: marketContext || {
            currentPrice: price,
          },
        }

        // Get Claude validation
        const startTime = Date.now()
        claudeAnalysis = await claudeService.validateSignal(userId, claudeRequest)
        const responseTime = Date.now() - startTime

        claudeWasUsed = true

        logger.debug({
          type: 'claude_validation_completed',
          userId,
          symbol,
          responseTime,
          isValid: claudeAnalysis.isValid,
          confidence: claudeAnalysis.confidence,
        })

        // Log Claude decision for analytics
        try {
          // TODO: Save to database
          // await db.query(`
          //   INSERT INTO order_claude_decisions (order_id, user_id, signal_validity, confidence, reasoning)
          //   VALUES ($1, $2, $3, $4, $5)
          // `)
        } catch (logError) {
          logger.error({
            type: 'claude_decision_logging_error',
            error: logError instanceof Error ? logError.message : String(logError),
          })
          // Don't block on logging error
        }
      } catch (claudeError: any) {
        logger.error({
          type: 'claude_validation_error',
          userId,
          symbol,
          error: claudeError.message,
        })
        // Don't block order creation if Claude fails
        claudeAnalysis = null
        claudeWasUsed = false
      }
    }

    // ===== ORDER CREATION =====
    logger.debug({
      type: 'order_creation_starting',
      userId,
      symbol,
      side,
      quantity,
      price,
    })

    const order = await orderService.createOrder(userId, {
      accountId,
      symbol,
      side,
      quantity,
      price,
      claudeDecisionId: undefined, // TODO: Add if saved to DB
    })

    logger.info({
      type: 'order_created_with_claude',
      userId,
      orderId: order.id,
      symbol,
      side,
      quantity,
      price,
      claudeUsed: claudeWasUsed,
      claudeValid: claudeAnalysis?.isValid,
      claudeConfidence: claudeAnalysis?.confidence,
    })

    // ===== RESPONSE =====
    const response: any = {
      status: 'success',
      order,
    }

    // Add Claude analysis if available
    if (claudeAnalysis) {
      response.claudeAnalysis = {
        isValid: claudeAnalysis.isValid,
        confidence: claudeAnalysis.confidence,
        reasoning: claudeAnalysis.reasoning,
        riskLevel: claudeAnalysis.riskLevel,
        adjustments: claudeAnalysis.adjustments,
      }
      response.message = 'Order created with Claude signal validation'
    } else if (canUseClaude) {
      response.message = 'Order created. Claude analysis failed, but order was processed.'
    } else {
      response.message = 'Upgrade to premium for Claude signal analysis'
    }

    res.status(201).json(response)
  } catch (error: any) {
    logger.error({
      type: 'order_creation_error',
      userId: (req as any).user?.userId,
      error: error.message,
      stack: error.stack,
    })
    res.status(500).json({ error: 'Failed to create order' })
  }
})

/**
 * POST /orders/standard (existing endpoint, unchanged)
 *
 * Create order without Claude analysis
 * Works for all users
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { accountId, symbol, side, quantity, price } = req.body
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!accountId || !symbol || !side || quantity === undefined || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!['BUY', 'SELL'].includes(side)) {
      return res.status(400).json({ error: 'Invalid side. Must be BUY or SELL' })
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' })
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' })
    }

    if (typeof symbol !== 'string' || symbol.trim().length === 0) {
      return res.status(400).json({ error: 'Symbol cannot be empty' })
    }

    const account = await accountService.getAccountById(accountId)
    if (!account) {
      return res.status(404).json({ error: 'Account not found' })
    }

    if (account.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const order = await orderService.createOrder(userId, {
      accountId,
      symbol,
      side,
      quantity,
      price,
    })

    logger.info({
      type: 'order_created_via_api',
      userId,
      orderId: order.id,
      symbol,
    })

    res.status(201).json(order)
  } catch (error) {
    logger.error({
      type: 'order_creation_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Get all user orders
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const orders = await orderService.getUserOrders(userId)
    res.json(orders)
  } catch (error) {
    logger.error({
      type: 'get_orders_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Get specific order
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const order = await orderService.getOrderById(id)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(order)
  } catch (error) {
    logger.error({
      type: 'get_order_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

export default router
