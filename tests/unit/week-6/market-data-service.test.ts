import { describe, it, expect } from 'vitest'
import { marketDataService } from '@/services/market-data-service'

describe('Market Data Service', () => {
  it('should get quote for a symbol', async () => {
    const quote = await marketDataService.getQuote('RELIANCE')

    expect(quote).not.toBeNull()
    expect(quote?.symbol).toBe('RELIANCE')
    expect(quote?.lastPrice).toBeGreaterThan(0)
    expect(quote?.bid).toBeGreaterThan(0)
    expect(quote?.ask).toBeGreaterThan(0)
  })

  it('should get multiple quotes', async () => {
    const symbols = ['INFY', 'TCS', 'WIPRO']
    const quotes = await marketDataService.getQuotes(symbols)

    expect(quotes.length).toBe(3)
    expect(quotes[0].symbol).toBe('INFY')
  })

  it('should create price subscription', async () => {
    const subscription = await marketDataService.subscribePrices('user-1', ['RELIANCE', 'INFY'])

    expect(subscription.id).toBeDefined()
    expect(subscription.userId).toBe('user-1')
    expect(subscription.symbols.length).toBe(2)
    expect(subscription.status).toBe('active')
  })

  it('should get user subscriptions', async () => {
    await marketDataService.subscribePrices('user-2', ['HDFC'])
    await marketDataService.subscribePrices('user-2', ['ICICIBANK'])

    const subscriptions = await marketDataService.getUserSubscriptions('user-2')
    expect(subscriptions.length).toBe(2)
  })

  it('should update subscription symbols', async () => {
    const sub = await marketDataService.subscribePrices('user-3', ['RELIANCE'])
    const updated = await marketDataService.updateSubscription(sub.id, ['INFY', 'TCS'])

    expect(updated?.symbols.length).toBe(2)
    expect(updated?.symbols).toContain('INFY')
  })

  it('should unsubscribe', async () => {
    const sub = await marketDataService.subscribePrices('user-4', ['MARUTI'])
    const deleted = await marketDataService.unsubscribe(sub.id)

    expect(deleted).toBe(true)
  })
})
