// @ts-nocheck
import { Router } from 'express'
import { marketDataService } from '../services/market-data-service.ts'
import { authMiddleware, AuthRequest } from '../middleware/auth.ts'
import { logger } from '../services/logger.ts'

const router = Router()

// Get quote for a symbol (no auth required - public data)
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol required' })
    }

    const quote = await marketDataService.getQuote(symbol.toUpperCase())

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' })
    }

    res.json(quote)
  } catch (error) {
    logger.error({
      type: 'quote_fetch_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to fetch quote' })
  }
})

// Get multiple quotes
router.post('/quotes', async (req, res) => {
  try {
    const { symbols } = req.body

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array required' })
    }

    const upperSymbols = symbols.map((s: string) => s.toUpperCase())
    const quotes = await marketDataService.getQuotes(upperSymbols)

    res.json(quotes)
  } catch (error) {
    logger.error({
      type: 'quotes_fetch_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to fetch quotes' })
  }
})

// Subscribe to price updates (requires auth)
router.post('/subscribe', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { symbols } = req.body
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array required' })
    }

    const subscription = await marketDataService.subscribePrices(
      userId,
      symbols.map((s: string) => s.toUpperCase())
    )

    logger.info({
      type: 'subscription_created_via_api',
      userId,
      subscriptionId: subscription.id,
    })

    res.status(201).json(subscription)
  } catch (error) {
    logger.error({
      type: 'subscription_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to create subscription' })
  }
})

// Get user's subscriptions
router.get('/subscriptions', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const subscriptions = await marketDataService.getUserSubscriptions(userId)
    res.json(subscriptions)
  } catch (error) {
    logger.error({
      type: 'get_subscriptions_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }
})

// Get specific subscription
router.get('/subscriptions/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const subscription = await marketDataService.getSubscription(id)

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    // Check ownership
    if (subscription.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(subscription)
  } catch (error) {
    logger.error({
      type: 'get_subscription_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to fetch subscription' })
  }
})

// Update subscription
router.put('/subscriptions/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { symbols } = req.body
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array required' })
    }

    const subscription = await marketDataService.getSubscription(id)

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    if (subscription.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const updated = await marketDataService.updateSubscription(
      id,
      symbols.map((s: string) => s.toUpperCase())
    )

    logger.info({
      type: 'subscription_updated_via_api',
      userId,
      subscriptionId: id,
    })

    res.json(updated)
  } catch (error) {
    logger.error({
      type: 'update_subscription_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to update subscription' })
  }
})

// Delete subscription
router.delete('/subscriptions/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const subscription = await marketDataService.getSubscription(id)

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    if (subscription.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const deleted = await marketDataService.unsubscribe(id)

    if (deleted) {
      logger.info({
        type: 'subscription_deleted_via_api',
        userId,
        subscriptionId: id,
      })
      res.status(204).send()
    } else {
      res.status(404).json({ error: 'Subscription not found' })
    }
  } catch (error) {
    logger.error({
      type: 'delete_subscription_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to delete subscription' })
  }
})

export default router
