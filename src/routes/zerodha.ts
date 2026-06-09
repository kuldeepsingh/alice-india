import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware, AuthRequest } from '../middleware/auth.ts'
import { zerodhaService } from '../services/zerodha-service.ts'
import { logger } from '../services/logger.ts'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * POST /api/v1/zerodha/connect/:accountId
 * Initiate Zerodha account connection
 */
router.post('/connect/:accountId', async (req: AuthRequest, res) => {
  const requestId = `zerodha-connect-${Date.now()}`
  
  try {
    const { accountId } = req.params
    const userId = req.user?.userId

    logger.debug('Zerodha', 'Connection request received', {
      requestId,
      accountId,
      userId
    })

    // In production, this would generate actual Zerodha OAuth URL
    // For mock: generate a fake callback URL
    const mockAccessToken = `access_${uuidv4().slice(0, 16)}`
    const mockZerodhaUserId = `ZD${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    // Link the account immediately (in production, this would happen after OAuth callback)
    const linked = await zerodhaService.linkAccount(accountId, mockZerodhaUserId, mockAccessToken)

    if (linked) {
      // Start sync
      await zerodhaService.syncAccount(accountId)

      logger.info('Zerodha', 'Account connected successfully', {
        requestId,
        accountId,
        zerodhaUserId: mockZerodhaUserId
      })

      return res.status(200).json({
        status: 'success',
        message: 'Zerodha account connected successfully',
        data: {
          accountId,
          zerodhaUserId: mockZerodhaUserId,
          syncStatus: 'synced'
        }
      })
    } else {
      throw new Error('Failed to link account')
    }
  } catch (error) {
    logger.error('Zerodha', `Connection failed: ${error instanceof Error ? error.message : String(error)}`, error, {
      requestId,
      accountId: req.params.accountId
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to connect Zerodha account',
      requestId
    })
  }
})

/**
 * GET /api/v1/zerodha/:accountId/holdings
 * Get Zerodha holdings for an account
 */
router.get('/:accountId/holdings', async (req: AuthRequest, res) => {
  try {
    const { accountId } = req.params

    logger.debug('Zerodha', 'Fetching holdings', { accountId })

    const holdings = await zerodhaService.getHoldings(accountId)

    res.status(200).json({
      status: 'success',
      data: holdings,
      count: holdings.length
    })
  } catch (error) {
    logger.error('Zerodha', `Failed to fetch holdings: ${error instanceof Error ? error.message : String(error)}`, error, {
      accountId: req.params.accountId
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch holdings'
    })
  }
})

/**
 * GET /api/v1/zerodha/:accountId/orders
 * Get Zerodha orders for an account
 */
router.get('/:accountId/orders', async (req: AuthRequest, res) => {
  try {
    const { accountId } = req.params

    logger.debug('Zerodha', 'Fetching orders', { accountId })

    const orders = await zerodhaService.getOrders(accountId)

    res.status(200).json({
      status: 'success',
      data: orders,
      count: orders.length
    })
  } catch (error) {
    logger.error('Zerodha', `Failed to fetch orders: ${error instanceof Error ? error.message : String(error)}`, error, {
      accountId: req.params.accountId
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders'
    })
  }
})

/**
 * GET /api/v1/zerodha/:accountId/balance
 * Get Zerodha account balance
 */
router.get('/:accountId/balance', async (req: AuthRequest, res) => {
  try {
    const { accountId } = req.params

    logger.debug('Zerodha', 'Fetching balance', { accountId })

    const balance = await zerodhaService.getBalance(accountId)

    if (!balance) {
      return res.status(404).json({
        status: 'error',
        message: 'Balance data not found'
      })
    }

    res.status(200).json({
      status: 'success',
      data: balance
    })
  } catch (error) {
    logger.error('Zerodha', `Failed to fetch balance: ${error instanceof Error ? error.message : String(error)}`, error, {
      accountId: req.params.accountId
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch balance'
    })
  }
})

/**
 * POST /api/v1/zerodha/:accountId/sync
 * Force sync Zerodha data
 */
router.post('/:accountId/sync', async (req: AuthRequest, res) => {
  const requestId = `zerodha-sync-${Date.now()}`
  
  try {
    const { accountId } = req.params

    logger.debug('Zerodha', 'Sync requested', { requestId, accountId })

    const synced = await zerodhaService.syncAccount(accountId)

    if (synced) {
      logger.info('Zerodha', 'Sync completed successfully', { requestId, accountId })

      res.status(200).json({
        status: 'success',
        message: 'Data synced successfully',
        requestId
      })
    } else {
      throw new Error('Sync failed')
    }
  } catch (error) {
    logger.error('Zerodha', `Sync failed: ${error instanceof Error ? error.message : String(error)}`, error, {
      requestId,
      accountId: req.params.accountId
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to sync data',
      requestId
    })
  }
})

export default router
