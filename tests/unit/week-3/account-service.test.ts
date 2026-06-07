import { describe, it, expect } from 'vitest'
import { accountService } from '@/services/account-service'

describe('Account Service', () => {
  const userId = 'user-123'

  it('should create account', async () => {
    const account = await accountService.createAccount(userId, {
      brokerType: 'zerodha',
      accountLabel: 'My Zerodha Account',
    })

    expect(account.id).toBeDefined()
    expect(account.userId).toBe(userId)
    expect(account.brokerType).toBe('zerodha')
  })

  it('should get account by id', async () => {
    const created = await accountService.createAccount(userId, {
      brokerType: 'upstox',
      accountLabel: 'Upstox Account',
    })

    const retrieved = await accountService.getAccountById(created.id)
    expect(retrieved?.id).toBe(created.id)
  })

  it('should get user accounts', async () => {
    const user1 = 'user-1'
    await accountService.createAccount(user1, {
      brokerType: 'zerodha',
      accountLabel: 'Account 1',
    })

    const accounts = await accountService.getUserAccounts(user1)
    expect(accounts.length).toBeGreaterThan(0)
  })

  it('should update account', async () => {
    const account = await accountService.createAccount(userId, {
      brokerType: 'zerodha',
      accountLabel: 'Original',
    })

    const updated = await accountService.updateAccount(account.id, {
      accountLabel: 'Updated',
    })

    expect(updated?.accountLabel).toBe('Updated')
  })

  it('should delete account', async () => {
    const account = await accountService.createAccount(userId, {
      brokerType: 'zerodha',
      accountLabel: 'To Delete',
    })

    const deleted = await accountService.deleteAccount(account.id)
    expect(deleted).toBe(true)
  })
})
