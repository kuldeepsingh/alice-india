export const factories = {
  user(overrides?: any) {
    return {
      email: 'test@example.com',
      password: 'test123',
      ...overrides,
    }
  },

  account(userId: string, overrides?: any) {
    return {
      user_id: userId,
      broker_type: 'zerodha',
      account_label: 'Test Account',
      ...overrides,
    }
  },

  order(userId: string, accountId: string, overrides?: any) {
    return {
      user_id: userId,
      account_id: accountId,
      symbol: 'NSE:RELIANCE',
      side: 'BUY',
      quantity: 10,
      price: 2650,
      status: 'PENDING',
      ...overrides,
    }
  },
}
