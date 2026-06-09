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

// Get all user accounts with comprehensive logging
router.get('/', async (req: AuthRequest, res) => {
  const requestId = `accounts-list-${Date.now()}`
  const startTime = Date.now()

  try {
    const userId = req.user?.userId
    const ipAddress = req.ip

    // LOG: Entry point
    logger.debug('Accounts', 'List accounts request received', {
      requestId,
      userId,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    if (!userId) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'List accounts failed - user not authenticated', {
        requestId,
        reason: 'not_authenticated',
        durationMs: duration,
      })
      return res.status(401).json({
        error: 'Unauthorized',
        reason: 'not_authenticated',
      })
    }

    // LOG: Fetching accounts from database
    logger.debug('Accounts', 'Querying all user accounts from database', {
      requestId,
      userId,
    })

    const queryStart = Date.now()
    const accounts = await accountService.getUserAccounts(userId)
    const queryDuration = Date.now() - queryStart

    const totalDuration = Date.now() - startTime

    // LOG: Success with statistics
    logger.info('Accounts', 'User accounts retrieved successfully', {
      requestId,
      userId,
      accountCount: accounts.length,
      brokerTypes: [...new Set(accounts.map(a => a.brokerType))],
      statusCounts: {
        active: accounts.filter(a => a.status === 'active').length,
        inactive: accounts.filter(a => a.status === 'inactive').length,
        suspended: accounts.filter(a => a.status === 'suspended').length,
      },
      queryDurationMs: queryDuration,
      totalDurationMs: totalDuration,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    res.json({
      status: 'success',
      data: accounts.map(a => ({
        id: a.id,
        userId: a.userId,
        brokerType: a.brokerType,
        accountLabel: a.accountLabel,
        status: a.status,
        brokerAccountId: a.brokerAccountId,
        created_at: a.created_at,
        updated_at: a.updated_at,
      })),
      count: accounts.length,
      requestId,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Accounts', `List accounts failed: ${errorMessage}`, error, {
      requestId,
      userId: req.user?.userId,
      errorMessage,
      durationMs: duration,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      error: 'Failed to fetch accounts',
      reason: 'server_error',
      requestId,
    })
  }
})

// Get specific account with comprehensive logging
router.get('/:id', async (req: AuthRequest, res) => {
  const requestId = `account-view-${Date.now()}`
  const startTime = Date.now()

  try {
    const { id } = req.params
    const userId = req.user?.userId
    const ipAddress = req.ip

    // LOG: Entry point
    logger.debug('Accounts', 'View account request received', {
      requestId,
      accountId: id,
      userId,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    // Authorization check
    if (!userId) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'View account failed - user not authenticated', {
        requestId,
        accountId: id,
        reason: 'not_authenticated',
        durationMs: duration,
      })
      return res.status(401).json({
        error: 'Unauthorized',
        reason: 'not_authenticated',
      })
    }

    // LOG: Fetching account from database
    logger.debug('Accounts', 'Fetching account details from database', {
      requestId,
      accountId: id,
      userId,
    })

    const queryStart = Date.now()
    const account = await accountService.getAccountById(id)
    const queryDuration = Date.now() - queryStart

    if (!account) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'View account failed - account not found', {
        requestId,
        accountId: id,
        userId,
        queryDurationMs: queryDuration,
        durationMs: duration,
      })
      return res.status(404).json({
        error: 'Account not found',
        reason: 'account_not_found',
      })
    }

    // LOG: Verify ownership
    if (account.userId !== userId) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'View account failed - access denied', {
        requestId,
        accountId: id,
        userId,
        accountOwnerId: account.userId,
        reason: 'access_denied',
        queryDurationMs: queryDuration,
        durationMs: duration,
      })
      return res.status(403).json({
        error: 'Access denied',
        reason: 'access_denied',
      })
    }

    // LOG: Success
    const totalDuration = Date.now() - startTime
    logger.info('Accounts', 'Account details retrieved successfully', {
      requestId,
      accountId: account.id,
      userId,
      brokerType: account.brokerType,
      accountLabel: account.accountLabel,
      status: account.status,
      queryDurationMs: queryDuration,
      totalDurationMs: totalDuration,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    res.json({
      status: 'success',
      data: {
        id: account.id,
        userId: account.userId,
        brokerType: account.brokerType,
        accountLabel: account.accountLabel,
        status: account.status,
        brokerAccountId: account.brokerAccountId,
        created_at: account.created_at,
        updated_at: account.updated_at,
      },
      requestId,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Accounts', `View account failed: ${errorMessage}`, error, {
      requestId,
      accountId: req.params.id,
      userId: req.user?.userId,
      errorMessage,
      durationMs: duration,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      error: 'Failed to fetch account',
      reason: 'server_error',
      requestId,
    })
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

// Add funds (deposit) with comprehensive logging
router.post('/:id/deposits', async (req: AuthRequest, res) => {
  const requestId = `deposit-${Date.now()}`
  const startTime = Date.now()

  try {
    const { id } = req.params
    const { amount, paymentMethod, reference } = req.body
    const userId = req.user?.userId
    const ipAddress = req.ip

    // LOG: Entry point
    logger.debug('Accounts', 'Deposit request received', {
      requestId,
      accountId: id,
      userId,
      amount,
      paymentMethod,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    // Authorization
    if (!userId) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'Deposit failed - user not authenticated', {
        requestId,
        accountId: id,
        reason: 'not_authenticated',
        durationMs: duration,
      })
      return res.status(401).json({
        error: 'Unauthorized',
        reason: 'not_authenticated',
      })
    }

    // Input validation
    logger.debug('Accounts', 'Validating deposit parameters', {
      requestId,
      userId,
      amountProvided: !!amount,
      paymentMethodProvided: !!paymentMethod,
    })

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'Deposit validation failed - invalid amount', {
        requestId,
        accountId: id,
        userId,
        providedAmount: amount,
        amountType: typeof amount,
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Amount must be a positive number',
        reason: 'invalid_amount',
      })
    }

    if (!paymentMethod || !['credit_card', 'bank_transfer', 'wallet'].includes(paymentMethod)) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'Deposit validation failed - invalid payment method', {
        requestId,
        accountId: id,
        userId,
        providedMethod: paymentMethod,
        allowedMethods: ['credit_card', 'bank_transfer', 'wallet'],
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Invalid payment method',
        reason: 'invalid_payment_method',
      })
    }

    // Verify account ownership
    logger.debug('Accounts', 'Verifying account ownership for deposit', {
      requestId,
      accountId: id,
      userId,
    })

    const accountStart = Date.now()
    const account = await accountService.getAccountById(id)
    const accountDuration = Date.now() - accountStart

    if (!account || account.userId !== userId) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'Deposit failed - account not found or access denied', {
        requestId,
        accountId: id,
        userId,
        accountFound: !!account,
        reason: account ? 'access_denied' : 'account_not_found',
        accountDurationMs: accountDuration,
        durationMs: duration,
      })
      return res.status(account ? 403 : 404).json({
        error: account ? 'Access denied' : 'Account not found',
        reason: account ? 'access_denied' : 'account_not_found',
      })
    }

    // LOG: Processing deposit
    logger.debug('Accounts', 'Processing deposit transaction', {
      requestId,
      accountId: id,
      userId,
      amount,
      paymentMethod,
    })

    // Simulate transaction processing
    const transactionStart = Date.now()
    // In real implementation, this would call payment gateway
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const transactionDuration = Date.now() - transactionStart

    const totalDuration = Date.now() - startTime

    // LOG: Success
    logger.info('Accounts', 'Deposit processed successfully', {
      requestId,
      accountId: id,
      userId,
      amount,
      paymentMethod,
      transactionId,
      status: 'pending', // Initial status before confirmation
      accountDurationMs: accountDuration,
      transactionDurationMs: transactionDuration,
      totalDurationMs: totalDuration,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    res.status(201).json({
      status: 'success',
      data: {
        transactionId,
        accountId: id,
        amount,
        paymentMethod,
        transactionStatus: 'pending',
        createdAt: new Date().toISOString(),
      },
      requestId,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Accounts', `Deposit failed: ${errorMessage}`, error, {
      requestId,
      accountId: req.params.id,
      userId: req.user?.userId,
      amount: req.body.amount,
      errorMessage,
      durationMs: duration,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      error: 'Failed to process deposit',
      reason: 'server_error',
      requestId,
    })
  }
})

// Withdraw funds with comprehensive logging
router.post('/:id/withdrawals', async (req: AuthRequest, res) => {
  const requestId = `withdrawal-${Date.now()}`
  const startTime = Date.now()

  try {
    const { id } = req.params
    const { amount, bankAccount, reference } = req.body
    const userId = req.user?.userId
    const ipAddress = req.ip

    // LOG: Entry point
    logger.debug('Accounts', 'Withdrawal request received', {
      requestId,
      accountId: id,
      userId,
      amount,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    // Authorization
    if (!userId) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'Withdrawal failed - user not authenticated', {
        requestId,
        accountId: id,
        reason: 'not_authenticated',
        durationMs: duration,
      })
      return res.status(401).json({
        error: 'Unauthorized',
        reason: 'not_authenticated',
      })
    }

    // Input validation
    logger.debug('Accounts', 'Validating withdrawal parameters', {
      requestId,
      userId,
      amountProvided: !!amount,
      bankAccountProvided: !!bankAccount,
    })

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'Withdrawal validation failed - invalid amount', {
        requestId,
        accountId: id,
        userId,
        providedAmount: amount,
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Amount must be a positive number',
        reason: 'invalid_amount',
      })
    }

    if (!bankAccount || typeof bankAccount !== 'string' || bankAccount.trim().length === 0) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'Withdrawal validation failed - invalid bank account', {
        requestId,
        accountId: id,
        userId,
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Bank account details required',
        reason: 'invalid_bank_account',
      })
    }

    // Verify account ownership
    logger.debug('Accounts', 'Verifying account ownership for withdrawal', {
      requestId,
      accountId: id,
      userId,
    })

    const accountStart = Date.now()
    const account = await accountService.getAccountById(id)
    const accountDuration = Date.now() - accountStart

    if (!account || account.userId !== userId) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'Withdrawal failed - account not found or access denied', {
        requestId,
        accountId: id,
        userId,
        accountFound: !!account,
        reason: account ? 'access_denied' : 'account_not_found',
        accountDurationMs: accountDuration,
        durationMs: duration,
      })
      return res.status(account ? 403 : 404).json({
        error: account ? 'Access denied' : 'Account not found',
        reason: account ? 'access_denied' : 'account_not_found',
      })
    }

    // LOG: Checking balance (simulated)
    logger.debug('Accounts', 'Checking account balance for withdrawal', {
      requestId,
      accountId: id,
      userId,
      requestedAmount: amount,
    })

    // Simulate balance check
    const simulatedBalance = 50000 // In real implementation, fetch from DB
    if (amount > simulatedBalance) {
      const duration = Date.now() - startTime
      logger.warn('Accounts', 'Withdrawal failed - insufficient balance', {
        requestId,
        accountId: id,
        userId,
        requestedAmount: amount,
        availableBalance: simulatedBalance,
        durationMs: duration,
      })
      return res.status(400).json({
        error: 'Insufficient balance',
        reason: 'insufficient_balance',
        availableBalance: simulatedBalance,
      })
    }

    // LOG: Processing withdrawal
    logger.debug('Accounts', 'Processing withdrawal transaction', {
      requestId,
      accountId: id,
      userId,
      amount,
      bankAccount: bankAccount.substring(0, 4) + '****', // Mask sensitive data
    })

    // Simulate transaction processing
    const transactionStart = Date.now()
    const transactionId = `WTH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const transactionDuration = Date.now() - transactionStart

    const totalDuration = Date.now() - startTime

    // LOG: Success
    logger.info('Accounts', 'Withdrawal processed successfully', {
      requestId,
      accountId: id,
      userId,
      amount,
      transactionId,
      status: 'processing',
      estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
      accountDurationMs: accountDuration,
      transactionDurationMs: transactionDuration,
      totalDurationMs: totalDuration,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    res.status(201).json({
      status: 'success',
      data: {
        transactionId,
        accountId: id,
        amount,
        transactionStatus: 'processing',
        estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      requestId,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Accounts', `Withdrawal failed: ${errorMessage}`, error, {
      requestId,
      accountId: req.params.id,
      userId: req.user?.userId,
      amount: req.body.amount,
      errorMessage,
      durationMs: duration,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      error: 'Failed to process withdrawal',
      reason: 'server_error',
      requestId,
    })
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
