/**
 * Trading Routes
 * Zerodha trading API endpoints
 */

import { Router, Request, Response } from 'express'
import { requireDeveloper, requireAdmin } from '../middleware/rbac.ts'
import { ZerodhaService } from '../services/zerodha-service.ts'
import { OrderService } from '../services/order-service.ts'

const router = Router()

/**
 * GET /api/v1/trading/instruments
 * Get available instruments
 */
router.get('/instruments', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const zerodhaService = new ZerodhaService(
      process.env.ZERODHA_API_KEY || '',
      process.env.ZERODHA_API_SECRET || '',
      (req as any).zerodhaToken
    )

    const instruments = await zerodhaService.getInstruments()

    res.json({
      status: 'success',
      data: instruments,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Instruments error:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch instruments',
    })
  }
})

/**
 * GET /api/v1/trading/search
 * Search instruments
 */
router.get('/search', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string

    if (!query || query.length < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Query parameter required',
      })
    }

    const zerodhaService = new ZerodhaService(
      process.env.ZERODHA_API_KEY || '',
      process.env.ZERODHA_API_SECRET || '',
      (req as any).zerodhaToken
    )

    const instruments = await zerodhaService.searchInstrument(query)

    res.json({
      status: 'success',
      data: instruments,
      count: instruments.length,
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * GET /api/v1/trading/quotes
 * Get market quotes
 */
router.get('/quotes', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const symbols = (req.query.symbols as string)?.split(',') || []

    if (symbols.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'symbols parameter required (comma-separated)',
      })
    }

    const zerodhaService = new ZerodhaService(
      process.env.ZERODHA_API_KEY || '',
      process.env.ZERODHA_API_SECRET || '',
      (req as any).zerodhaToken
    )

    const quotes = await zerodhaService.getQuotes(symbols)

    res.json({
      status: 'success',
      data: quotes,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * GET /api/v1/trading/profile
 * Get user profile
 */
router.get('/profile', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const zerodhaService = new ZerodhaService(
      process.env.ZERODHA_API_KEY || '',
      process.env.ZERODHA_API_SECRET || '',
      (req as any).zerodhaToken
    )

    const profile = await zerodhaService.getProfile()

    res.json({
      status: 'success',
      data: profile,
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * GET /api/v1/trading/portfolio
 * Get complete portfolio
 */
router.get('/portfolio', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const zerodhaService = new ZerodhaService(
      process.env.ZERODHA_API_KEY || '',
      process.env.ZERODHA_API_SECRET || '',
      (req as any).zerodhaToken
    )

    const portfolio = await zerodhaService.getPortfolio()

    res.json({
      status: 'success',
      data: portfolio,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * GET /api/v1/trading/positions
 * Get user positions
 */
router.get('/positions', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const zerodhaService = new ZerodhaService(
      process.env.ZERODHA_API_KEY || '',
      process.env.ZERODHA_API_SECRET || '',
      (req as any).zerodhaToken
    )

    const positions = await zerodhaService.getPositions()

    res.json({
      status: 'success',
      data: positions,
      count: positions.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * GET /api/v1/trading/holdings
 * Get user holdings
 */
router.get('/holdings', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const zerodhaService = new ZerodhaService(
      process.env.ZERODHA_API_KEY || '',
      process.env.ZERODHA_API_SECRET || '',
      (req as any).zerodhaToken
    )

    const holdings = await zerodhaService.getHoldings()

    res.json({
      status: 'success',
      data: holdings,
      count: holdings.length,
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * POST /api/v1/trading/orders
 * Place an order
 */
router.post('/orders', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const { tradingSymbol, instrumentToken, quantity, price, orderType, transactionType, validity, product } = req.body

    if (!tradingSymbol || !quantity || !price) {
      return res.status(400).json({
        status: 'error',
        message: 'tradingSymbol, quantity, and price are required',
      })
    }

    const userId = (req as any).user.id
    const zerodhaService = new ZerodhaService(
      process.env.ZERODHA_API_KEY || '',
      process.env.ZERODHA_API_SECRET || '',
      (req as any).zerodhaToken
    )

    const orderService = new OrderService(zerodhaService)

    const orderRequest = {
      tradingSymbol,
      instrumentToken: instrumentToken || '',
      quantity,
      price,
      orderType: orderType || 'REGULAR',
      transactionType,
      validity: validity || 'DAY',
      product: product || 'MIS',
    }

    const order = await orderService.createOrder(userId, orderRequest)

    res.status(201).json({
      status: 'success',
      data: order,
      message: 'Order placed successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * GET /api/v1/trading/orders
 * Get user orders
 */
router.get('/orders', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0

    const zerodhaService = new ZerodhaService(
      process.env.ZERODHA_API_KEY || '',
      process.env.ZERODHA_API_SECRET || '',
      (req as any).zerodhaToken
    )

    const orderService = new OrderService(zerodhaService)
    const orders = await orderService.getOrders(userId, { limit, offset })

    res.json({
      status: 'success',
      data: orders,
      count: orders.length,
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

export default router
