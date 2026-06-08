import { Router } from 'express'
import { OrderService } from '../services/order-service.ts'
import { accountService } from '../services/account-service.ts'
import { authMiddleware, AuthRequest } from '../middleware/auth.ts'
import { logger } from '../services/logger.ts'

const router = Router()
const orderService = new OrderService()

// All order routes require authentication
router.use(authMiddleware)

// Create order
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

// Cancel order
router.post('/:id/cancel', async (req: AuthRequest, res) => {
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

    const cancelled = await orderService.cancelOrder(id)

    logger.info({
      type: 'order_cancelled_via_api',
      userId,
      orderId: id,
    })

    res.json(cancelled)
  } catch (error) {
    logger.error({
      type: 'cancel_order_error',
      error: error instanceof Error ? error.message : String(error),
    })

    if (error instanceof Error && error.message.includes('Cannot cancel')) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: 'Failed to cancel order' })
  }
})

export default router
