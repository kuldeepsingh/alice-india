// @ts-nocheck
import { Router } from 'express'
import { OrderService } from '../services/order-service.ts'
import { accountService } from '../services/account-service.ts'
import { authMiddleware, AuthRequest } from '../middleware/auth.ts'
import { logger } from '../services/logger.ts'

const router = Router()
const orderService = new OrderService()

// All order routes require authentication
router.use(authMiddleware)

// Create order with comprehensive logging
router.post('/', async (req: AuthRequest, res) => {
  // Generate operation ID for complete request tracing
  const requestId = `order-create-${Date.now()}`
  const startTime = Date.now()

  try {
    const { accountId, symbol, side, quantity, price } = req.body
    const userId = req.user?.userId
    const ipAddress = req.ip

    // LOG: Entry point - API received create order request
    logger.debug('Orders', 'Create order request received from client', {
      requestId,
      userId,
      accountId,
      symbol,
      side,
      quantity,
      price,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    // ===== AUTHORIZATION =====
    if (!userId) {
      const duration = Date.now() - startTime
      logger.warn('Orders', 'Create order failed - user not authenticated', {
        requestId,
        reason: 'not_authenticated',
        ipAddress,
        durationMs: duration,
      })
      return res.status(401).json({
        error: 'Unauthorized',
        reason: 'not_authenticated',
      })
    }

    // ===== INPUT VALIDATION =====
    logger.debug('Orders', 'Validating order input parameters', {
      requestId,
      userId,
      validations: {
        accountIdProvided: !!accountId,
        symbolProvided: !!symbol,
        sideProvided: !!side,
        quantityProvided: quantity !== undefined,
        priceProvided: price !== undefined,
      },
    })

    // Check all required fields (accountId is optional)
    if (!symbol || !side || quantity === undefined || price === undefined) {
      const duration = Date.now() - startTime
      logger.warn('Orders', 'Create order validation failed - missing required fields', {
        requestId,
        userId,
        missingFields: {
          symbol: !symbol,
          side: !side,
          quantity: quantity === undefined,
          price: price === undefined,
        },
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Missing required fields',
        reason: 'missing_fields',
      })
    }

    // Validate side (BUY or SELL)
    if (!['BUY', 'SELL'].includes(side)) {
      const duration = Date.now() - startTime
      logger.warn('Orders', 'Create order validation failed - invalid side', {
        requestId,
        userId,
        providedSide: side,
        allowedSides: ['BUY', 'SELL'],
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Invalid side. Must be BUY or SELL',
        reason: 'invalid_side',
      })
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity <= 0) {
      const duration = Date.now() - startTime
      logger.warn('Orders', 'Create order validation failed - invalid quantity', {
        requestId,
        userId,
        providedQuantity: quantity,
        quantityType: typeof quantity,
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Quantity must be a positive number',
        reason: 'invalid_quantity',
      })
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      const duration = Date.now() - startTime
      logger.warn('Orders', 'Create order validation failed - invalid price', {
        requestId,
        userId,
        providedPrice: price,
        priceType: typeof price,
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Price must be a positive number',
        reason: 'invalid_price',
      })
    }

    // Validate symbol
    if (typeof symbol !== 'string' || symbol.trim().length === 0) {
      const duration = Date.now() - startTime
      logger.warn('Orders', 'Create order validation failed - invalid symbol', {
        requestId,
        userId,
        providedSymbol: symbol,
        symbolType: typeof symbol,
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Symbol cannot be empty',
        reason: 'invalid_symbol',
      })
    }

    logger.debug('Orders', 'All input validations passed', {
      requestId,
      userId,
      symbol: symbol.toUpperCase(),
      side,
      quantity,
      price,
    })

    // ===== ACCOUNT VERIFICATION (Optional) =====
    let account = null
    if (accountId) {
      logger.debug('Orders', 'Fetching account details from database', {
        requestId,
        userId,
        accountId,
      })

      const accountStart = Date.now()
      account = await accountService.getAccountById(accountId)
      const accountDuration = Date.now() - accountStart

      if (!account) {
        const duration = Date.now() - startTime
        logger.warn('Orders', 'Create order failed - account not found', {
          requestId,
          userId,
          accountId,
          accountDurationMs: accountDuration,
          durationMs: duration,
        })
        return res.status(404).json({
          error: 'Account not found',
          reason: 'account_not_found',
        })
      }

      logger.debug('Orders', 'Account found, verifying ownership', {
        requestId,
        userId,
        accountId,
        accountOwnerId: account.userId,
        accountDurationMs: accountDuration,
      })

      // Verify user owns the account
      if (account.userId !== userId) {
        const duration = Date.now() - startTime
        logger.warn('Orders', 'Create order failed - access denied to account', {
          requestId,
          userId,
          accountId,
          accountOwnerId: account.userId,
          reason: 'access_denied',
          durationMs: duration,
        })
        return res.status(403).json({
          error: 'Access denied',
          reason: 'access_denied',
        })
      }
    }

    // ===== ORDER CREATION =====
    logger.debug('Orders', 'Creating order in database', {
      requestId,
      userId,
      accountId,
      symbol: symbol.toUpperCase(),
      side,
      quantity,
      price,
      totalValue: quantity * price,
    })

    const orderStart = Date.now()
    const order = await orderService.createOrder(userId, {
      accountId,
      symbol: symbol.toUpperCase(),
      side,
      quantity,
      price,
    })
    const orderDuration = Date.now() - orderStart

    logger.debug('Orders', 'Order created in database', {
      requestId,
      orderId: order.id,
      userId,
      accountId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      totalValue: order.quantity * order.price,
      status: order.status,
      orderDurationMs: orderDuration,
      createdAt: order.created_at,
    })

    // ===== SUCCESS =====
    const totalDuration = Date.now() - startTime

    logger.info('Orders', 'Order created successfully', {
      requestId,
      orderId: order.id,
      userId,
      accountId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      totalValue: order.quantity * order.price,
      status: order.status,
      accountDurationMs: accountDuration,
      orderDurationMs: orderDuration,
      totalDurationMs: totalDuration,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    res.status(201).json({
      status: 'success',
      data: order,
      requestId,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    logger.error('Orders', `Order creation failed: ${errorMessage}`, error, {
      requestId,
      userId: req.user?.userId,
      accountId: req.body.accountId,
      symbol: req.body.symbol,
      errorMessage,
      errorStack,
      durationMs: duration,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      error: 'Failed to create order',
      reason: 'server_error',
      requestId,
    })
  }
})

// Get all user orders with comprehensive logging
router.get('/', async (req: AuthRequest, res) => {
  const requestId = `order-list-${Date.now()}`
  const startTime = Date.now()

  try {
    const userId = req.user?.userId
    const ipAddress = req.ip

    // LOG: Entry point
    logger.debug('Orders', 'Fetch orders request received', {
      requestId,
      userId,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    if (!userId) {
      const duration = Date.now() - startTime
      logger.warn('Orders', 'Fetch orders failed - user not authenticated', {
        requestId,
        reason: 'not_authenticated',
        durationMs: duration,
      })
      return res.status(401).json({
        error: 'Unauthorized',
        reason: 'not_authenticated',
      })
    }

    // LOG: Fetching orders from database
    logger.debug('Orders', 'Querying user orders from database', {
      requestId,
      userId,
    })

    const queryStart = Date.now()
    const orders = await orderService.getUserOrders(userId)
    const queryDuration = Date.now() - queryStart

    const totalDuration = Date.now() - startTime

    // LOG: Orders fetched successfully
    logger.info('Orders', 'User orders fetched successfully', {
      requestId,
      userId,
      orderCount: orders.length,
      queryDurationMs: queryDuration,
      totalDurationMs: totalDuration,
      statuses: {
        pending: orders.filter((o: any) => o.status === 'pending').length,
        filled: orders.filter((o: any) => o.status === 'filled').length,
        cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
      },
      timestamp: new Date().toISOString(),
    })

    res.json({
      status: 'success',
      data: orders,
      count: orders.length,
      requestId,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Orders', `Fetch orders failed: ${errorMessage}`, error, {
      requestId,
      userId: req.user?.userId,
      errorMessage,
      durationMs: duration,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      error: 'Failed to fetch orders',
      reason: 'server_error',
      requestId,
    })
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

    if (order.user_id !== userId) {
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

// Update order
router.put('/:id', async (req: AuthRequest, res) => {
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

    if (order.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const updated = await orderService.updateOrder(id, req.body)

    logger.info({
      type: 'order_updated_via_api',
      userId,
      orderId: id,
    })

    res.json(updated)
  } catch (error) {
    logger.error({
      type: 'update_order_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to update order' })
  }
})

// Cancel order with comprehensive logging
router.post('/:id/cancel', async (req: AuthRequest, res) => {
  const requestId = `order-cancel-${Date.now()}`
  const startTime = Date.now()

  try {
    const { id } = req.params
    const userId = req.user?.userId
    const ipAddress = req.ip

    // LOG: Entry point
    logger.debug('Orders', 'Cancel order request received', {
      requestId,
      orderId: id,
      userId,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    // Authorization check
    if (!userId) {
      const duration = Date.now() - startTime
      logger.warn('Orders', 'Cancel order failed - user not authenticated', {
        requestId,
        orderId: id,
        reason: 'not_authenticated',
        durationMs: duration,
      })
      return res.status(401).json({
        error: 'Unauthorized',
        reason: 'not_authenticated',
      })
    }

    // LOG: Fetching order from database
    logger.debug('Orders', 'Fetching order from database', {
      requestId,
      orderId: id,
      userId,
    })

    const orderStart = Date.now()
    const order = await orderService.getOrderById(id)
    const orderFetchDuration = Date.now() - orderStart

    if (!order) {
      const duration = Date.now() - startTime
      logger.warn('Orders', 'Cancel order failed - order not found', {
        requestId,
        orderId: id,
        userId,
        orderFetchDurationMs: orderFetchDuration,
        durationMs: duration,
      })
      return res.status(404).json({
        error: 'Order not found',
        reason: 'order_not_found',
      })
    }

    // Verify ownership
    if (order.user_id !== userId) {
      const duration = Date.now() - startTime
      logger.warn('Orders', 'Cancel order failed - access denied', {
        requestId,
        orderId: id,
        userId,
        orderOwnerId: order.user_id,
        reason: 'access_denied',
        durationMs: duration,
      })
      return res.status(403).json({
        error: 'Access denied',
        reason: 'access_denied',
      })
    }

    // LOG: Current order status before cancellation
    logger.debug('Orders', 'Order fetched, current status', {
      requestId,
      orderId: id,
      userId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      currentStatus: order.status,
      orderFetchDurationMs: orderFetchDuration,
    })

    // LOG: Cancelling order
    logger.debug('Orders', 'Cancelling order in database', {
      requestId,
      orderId: id,
      userId,
      currentStatus: order.status,
    })

    const cancelStart = Date.now()
    const cancelled = await orderService.cancelOrder(id)
    const cancelDuration = Date.now() - cancelStart

    // LOG: Order cancelled successfully
    const totalDuration = Date.now() - startTime
    logger.info('Orders', 'Order cancelled successfully', {
      requestId,
      orderId: id,
      userId,
      symbol: cancelled.symbol,
      side: cancelled.side,
      quantity: cancelled.quantity,
      previousStatus: order.status,
      newStatus: cancelled.status,
      orderFetchDurationMs: orderFetchDuration,
      cancelDurationMs: cancelDuration,
      totalDurationMs: totalDuration,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    res.json({
      status: 'success',
      data: cancelled,
      requestId,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Orders', `Cancel order failed: ${errorMessage}`, error, {
      requestId,
      orderId: req.params.id,
      userId: req.user?.userId,
      errorMessage,
      durationMs: duration,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    if (error instanceof Error && error.message.includes('Cannot cancel')) {
      return res.status(400).json({
        error: error.message,
        reason: 'cannot_cancel_status',
        requestId,
      })
    }

    res.status(500).json({
      error: 'Failed to cancel order',
      reason: 'server_error',
      requestId,
    })
  }
})

export default router
