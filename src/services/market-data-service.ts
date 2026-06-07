import { logger } from './logger.ts'
import { query } from './database.ts'

export interface MarketQuote {
  symbol: string
  lastPrice: number
  bid: number
  ask: number
  bidQuantity: number
  askQuantity: number
  timestamp: string
  percentChange: number
  change: number
  high?: number
  low?: number
  open?: number
  close?: number
}

export interface PriceSubscription {
  id: string
  userId: string
  symbols: string[]
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// In-memory market data storage (will be enhanced with real Zerodha data)
const marketQuotes: Map<string, MarketQuote> = new Map()
const priceSubscriptions: Map<string, PriceSubscription> = new Map()

export const marketDataService = {
  // Get current market quote for a symbol
  async getQuote(symbol: string): Promise<MarketQuote | null> {
    try {
      // Check cache first
      let quote = marketQuotes.get(symbol)
      
      if (!quote) {
        // In a real implementation, this would fetch from Zerodha API
        // For now, return mock data
        quote = {
          symbol,
          lastPrice: Math.random() * 5000 + 500,
          bid: Math.random() * 5000 + 499,
          ask: Math.random() * 5000 + 501,
          bidQuantity: Math.floor(Math.random() * 10000),
          askQuantity: Math.floor(Math.random() * 10000),
          timestamp: new Date().toISOString(),
          percentChange: (Math.random() - 0.5) * 10,
          change: (Math.random() - 0.5) * 100,
        }

        marketQuotes.set(symbol, quote)
      }

      logger.info({
        type: 'quote_fetched',
        symbol,
        price: quote.lastPrice,
      })

      return quote
    } catch (error) {
      logger.error({
        type: 'quote_fetch_error',
        symbol,
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  },

  // Get multiple quotes
  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    const quotes = await Promise.all(
      symbols.map(symbol => this.getQuote(symbol))
    )
    return quotes.filter((q): q is MarketQuote => q !== null)
  },

  // Subscribe user to price updates
  async subscribePrices(
    userId: string,
    symbols: string[]
  ): Promise<PriceSubscription> {
    try {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      const subscription: PriceSubscription = {
        id,
        userId,
        symbols: [...new Set(symbols)], // Remove duplicates
        status: 'active',
        created_at: now,
        updated_at: now,
      }

      priceSubscriptions.set(id, subscription)

      logger.info({
        type: 'price_subscription_created',
        userId,
        symbols: symbols.length,
        subscriptionId: id,
      })

      return subscription
    } catch (error) {
      logger.error({
        type: 'price_subscription_error',
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  },

  // Get user's subscriptions
  async getUserSubscriptions(userId: string): Promise<PriceSubscription[]> {
    return Array.from(priceSubscriptions.values()).filter(
      (sub) => sub.userId === userId
    )
  },

  // Get specific subscription
  async getSubscription(id: string): Promise<PriceSubscription | null> {
    return priceSubscriptions.get(id) || null
  },

  // Update subscription (add/remove symbols)
  async updateSubscription(
    id: string,
    symbols: string[]
  ): Promise<PriceSubscription | null> {
    const subscription = priceSubscriptions.get(id)
    if (!subscription) {
      return null
    }

    const now = new Date().toISOString()
    const updated: PriceSubscription = {
      ...subscription,
      symbols: [...new Set(symbols)],
      updated_at: now,
    }

    priceSubscriptions.set(id, updated)

    logger.info({
      type: 'subscription_updated',
      subscriptionId: id,
      symbols: symbols.length,
    })

    return updated
  },

  // Unsubscribe
  async unsubscribe(id: string): Promise<boolean> {
    const existed = priceSubscriptions.has(id)
    if (existed) {
      priceSubscriptions.delete(id)
      logger.info({
        type: 'subscription_deleted',
        subscriptionId: id,
      })
    }
    return existed
  },

  // Get all quotes (for broadcasting to WebSocket clients)
  getAllQuotes(): MarketQuote[] {
    return Array.from(marketQuotes.values())
  },

  // Update quote (called by real-time data feed)
  updateQuote(symbol: string, quote: Partial<MarketQuote>) {
    const existing = marketQuotes.get(symbol)
    if (existing) {
      marketQuotes.set(symbol, { ...existing, ...quote })
    } else {
      marketQuotes.set(symbol, {
        symbol,
        lastPrice: 0,
        bid: 0,
        ask: 0,
        bidQuantity: 0,
        askQuantity: 0,
        timestamp: new Date().toISOString(),
        percentChange: 0,
        change: 0,
        ...quote,
      })
    }
  },
}
