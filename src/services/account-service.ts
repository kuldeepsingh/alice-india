// @ts-nocheck
import { v4 as uuidv4 } from 'uuid'
import { logger } from './logger.ts'
import { query } from './database.ts'

export interface TradingAccount {
  id: string
  userId: string
  brokerType: string
  accountLabel: string
  status: string
  brokerAccountId?: string
  created_at: string
  updated_at: string
}

export interface CreateAccountRequest {
  brokerType: 'zerodha' | 'upstox' | 'shoonya'
  accountLabel: string
  brokerAccountId?: string
}

export interface UpdateAccountRequest {
  accountLabel?: string
  status?: string
}

export const accountService = {
  async createAccount(userId: string, request: CreateAccountRequest): Promise<TradingAccount> {
    if (!request.brokerType || !request.accountLabel) {
      throw new Error('Broker type and account label required')
    }

    const id = uuidv4()
    const now = new Date().toISOString()

    const result = await query(
      'INSERT INTO trading_accounts (id, user_id, broker_type, account_label, status, broker_account_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, userId, request.brokerType, request.accountLabel, 'active', request.brokerAccountId, now, now]
    )

    logger.info({
      type: 'account_created',
      accountId: id,
      userId,
    })

    return result.rows[0]
  },

  async getAccountById(id: string): Promise<TradingAccount | null> {
    const result = await query(
      'SELECT * FROM trading_accounts WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  },

  async getUserAccounts(userId: string): Promise<TradingAccount[]> {
    const result = await query(
      'SELECT * FROM trading_accounts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    return result.rows
  },

  async updateAccount(id: string, request: UpdateAccountRequest): Promise<TradingAccount | null> {
    const now = new Date().toISOString()
    
    const result = await query(
      'UPDATE trading_accounts SET account_label = COALESCE($1, account_label), status = COALESCE($2, status), updated_at = $3 WHERE id = $4 RETURNING *',
      [request.accountLabel, request.status, now, id]
    )

    if (result.rows.length === 0) {
      return null
    }

    logger.info({
      type: 'account_updated',
      accountId: id,
    })

    return result.rows[0]
  },

  async deleteAccount(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM trading_accounts WHERE id = $1',
      [id]
    )

    if (result.rowCount && result.rowCount > 0) {
      logger.info({
        type: 'account_deleted',
        accountId: id,
      })
      return true
    }

    return false
  },
}
