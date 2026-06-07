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

    // Convert snake_case to camelCase for response
    res.status(201).json({
      id: account.id,
      userId: account.userId,
      brokerType: account.brokerType,
      accountLabel: account.accountLabel,
      status: account.status,
      brokerAccountId: account.brokerAccountId,
      created_at: account.created_at,
      updated_at: account.updated_at,
    })
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
    res.json(accounts.map(a => ({
      id: a.id,
      userId: a.userId,
      brokerType: a.brokerType,
      accountLabel: a.accountLabel,
      status: a.status,
      brokerAccountId: a.brokerAccountId,
      created_at: a.created_at,
      updated_at: a.updated_at,
    })))
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

    if (account.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({
      id: account.id,
      userId: account.userId,
      brokerType: account.brokerType,
      accountLabel: account.accountLabel,
      status: account.status,
      brokerAccountId: account.brokerAccountId,
      created_at: account.created_at,
      updated_at: account.updated_at,
    })
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

    if (account.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

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

    res.json({
      id: updated!.id,
      userId: updated!.userId,
      brokerType: updated!.brokerType,
      accountLabel: updated!.accountLabel,
      status: updated!.status,
      brokerAccountId: updated!.brokerAccountId,
      created_at: updated!.created_at,
      updated_at: updated!.updated_at,
    })
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
