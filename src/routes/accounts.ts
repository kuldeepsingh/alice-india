import { Router } from 'express'
import { accountService } from '../services/account-service.ts'
import { authMiddleware, AuthRequest } from '../middleware/auth.ts'
import { logger } from '../services/logger.ts'

const router = Router()

// All account routes require authentication
router.use(authMiddleware)

// Create account
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { brokerType, accountLabel, brokerAccountId } = req.body
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Validation
    if (!brokerType || !accountLabel) {
      return res.status(400).json({ error: 'Broker type and account label required' })
    }

    if (!['zerodha', 'upstox', 'shoonya'].includes(brokerType)) {
      return res.status(400).json({ error: 'Invalid broker type' })
    }

    if (typeof accountLabel !== 'string' || accountLabel.trim().length === 0) {
      return res.status(400).json({ error: 'Account label cannot be empty' })
    }

    const account = await accountService.createAccount(userId, {
      brokerType,
      accountLabel,
      brokerAccountId,
    })

    logger.info({
      type: 'account_created_via_api',
      userId,
      accountId: account.id,
    })

    res.status(201).json(account)
  } catch (error) {
    logger.error({
      type: 'account_creation_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to create account' })
  }
})

// Get all user accounts
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const accounts = await accountService.getUserAccounts(userId)
    res.json(accounts)
  } catch (error) {
    logger.error({
      type: 'get_accounts_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to fetch accounts' })
  }
})

// Get specific account
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const account = await accountService.getAccountById(id)

    if (!account) {
      return res.status(404).json({ error: 'Account not found' })
    }

    // Check ownership
    if (account.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(account)
  } catch (error) {
    logger.error({
      type: 'get_account_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to fetch account' })
  }
})

// Update account
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { accountLabel, status } = req.body
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const account = await accountService.getAccountById(id)

    if (!account) {
      return res.status(404).json({ error: 'Account not found' })
    }

    // Check ownership
    if (account.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Validation
    if (status && !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const updated = await accountService.updateAccount(id, {
      accountLabel,
      status,
    })

    logger.info({
      type: 'account_updated_via_api',
      userId,
      accountId: id,
    })

    res.json(updated)
  } catch (error) {
    logger.error({
      type: 'update_account_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to update account' })
  }
})

// Delete account
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const account = await accountService.getAccountById(id)

    if (!account) {
      return res.status(404).json({ error: 'Account not found' })
    }

    // Check ownership
    if (account.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const deleted = await accountService.deleteAccount(id)

    if (deleted) {
      logger.info({
        type: 'account_deleted_via_api',
        userId,
        accountId: id,
      })
      res.status(204).send()
    } else {
      res.status(404).json({ error: 'Account not found' })
    }
  } catch (error) {
    logger.error({
      type: 'delete_account_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

export default router
