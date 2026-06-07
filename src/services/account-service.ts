import { v4 as uuidv4 } from 'uuid'
import { logger } from './logger.ts'

export interface TradingAccount {
  id: string
  userId: string
  brokerType: 'zerodha' | 'upstox' | 'shoonya'
  accountLabel: string
  status: 'active' | 'inactive' | 'suspended'
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
  status?: 'active' | 'inactive' | 'suspended'
}

// In-memory storage (will be replaced with database)
const accounts: Map<string, TradingAccount> = new Map()

export const accountService = {
  async createAccount(
    userId: string,
    request: CreateAccountRequest
  ): Promise<TradingAccount> {
    logger.info({
      type: 'account_creation_start',
      userId,
      brokerType: request.brokerType,
    })

    // Validate input
    if (!request.brokerType || !request.accountLabel) {
      throw new Error('Broker type and account label required')
    }

    const id = uuidv4()
    const now = new Date().toISOString()

    const account: TradingAccount = {
      id,
      userId,
      brokerType: request.brokerType,
      accountLabel: request.accountLabel,
      status: 'active',
      brokerAccountId: request.brokerAccountId,
      created_at: now,
      updated_at: now,
    }

    accounts.set(id, account)

    logger.info({
      type: 'account_created',
      accountId: id,
      userId,
    })

    return account
  },

  async getAccountById(id: string): Promise<TradingAccount | null> {
    return accounts.get(id) || null
  },

  async getUserAccounts(userId: string): Promise<TradingAccount[]> {
    return Array.from(accounts.values()).filter(a => a.userId === userId)
  },

  async updateAccount(
    id: string,
    request: UpdateAccountRequest
  ): Promise<TradingAccount | null> {
    const account = accounts.get(id)
    if (!account) {
      return null
    }

    const now = new Date().toISOString()
    const updated: TradingAccount = {
      ...account,
      accountLabel: request.accountLabel ?? account.accountLabel,
      status: request.status ?? account.status,
      updated_at: now,
    }

    accounts.set(id, updated)

    logger.info({
      type: 'account_updated',
      accountId: id,
    })

    return updated
  },

  async deleteAccount(id: string): Promise<boolean> {
    const existed = accounts.has(id)
    if (existed) {
      accounts.delete(id)
      logger.info({
        type: 'account_deleted',
        accountId: id,
      })
    }
    return existed
  },

  async getAllAccounts(): Promise<TradingAccount[]> {
    return Array.from(accounts.values())
  },
}
