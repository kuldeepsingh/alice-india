/**
 * Zerodha Service
 * Complete Zerodha API integration for trading
 */

import crypto from 'crypto'
import { CacheService } from './cache-service.ts'
import {
  ZerodhaAuth,
  AuthResponse,
  Instrument,
  MarketQuote,
  Order,
  OrderRequest,
  Position,
  Holding,
  Portfolio,
  ProfileInfo,
  Trade,
  ApiResponse,
  PaginatedResponse,
} from '../models/trading.ts'

export class ZerodhaService {
  private apiKey: string
  private apiSecret: string
  private accessToken?: string
  private userId?: string
  private readonly baseUrl = 'https://api.kite.trade'
  private readonly dataUrl = 'https://data.kite.trade'
  private requestsCached = true

  constructor(apiKey: string, apiSecret: string, accessToken?: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.accessToken = accessToken
  }

  /**
   * Generate login URL for OAuth authentication
   */
  getLoginUrl(): string {
    const checksum = crypto
      .createHash('sha256')
      .update(`${this.apiKey}:${this.apiSecret}`)
      .digest('hex')

    return `https://kite.zerodha.com/connect/login?api_key=${this.apiKey}&v=3`
  }

  /**
   * Authorize with request token
   */
  async authorizeWithCode(requestToken: string): Promise<ZerodhaAuth> {
    try {
      const checksum = crypto
        .createHash('sha256')
        .update(`${this.apiKey}${requestToken}${this.apiSecret}`)
        .digest('hex')

      const params = new URLSearchParams({
        api_key: this.apiKey,
        request_token: requestToken,
        checksum: checksum,
      })

      const response = await fetch(`${this.baseUrl}/session/token`, {
        method: 'POST',
        body: params,
      })

      const data = (await response.json()) as any

      if (data.status === 'success') {
        this.accessToken = data.data.access_token
        this.userId = data.data.user_id

        return {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
          requestToken,
          accessToken: data.data.access_token,
          refreshToken: data.data.refresh_token,
        }
      }

      throw new Error(data.error_description || 'Authorization failed')
    } catch (error) {
      console.error('Zerodha authorization error:', error)
      throw error
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers = {
      'X-Kite-Version': '3',
      Authorization: `token ${this.apiKey}:${this.accessToken}`,
      ...(options.headers || {}),
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error)
      throw error
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<ProfileInfo> {
    const cacheKey = CacheService.getDebugKey('zerodha:profile')
    const cached = await CacheService.get<ProfileInfo>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      const response = (await this.request('/user/profile')) as ApiResponse<any>

      if (response.status === 'success' && response.data) {
        const profile: ProfileInfo = {
          userId: response.data.user_id,
          userName: response.data.user_name,
          userShortname: response.data.user_shortname,
          email: response.data.email,
          phone: response.data.phone,
          brokerName: response.data.broker,
          brokerCode: response.data.broker_shortname || '',
          avatarUrl: response.data.avatar_url || '',
          products: response.data.products || [],
          orderType: response.data.order_type || [],
        }

        await CacheService.set(cacheKey, profile, { ttl: 30 * 60 })
        return profile
      }

      throw new Error('Failed to fetch profile')
    } catch (error) {
      console.error('Profile fetch error:', error)
      throw error
    }
  }

  /**
   * Get instruments list
   */
  async getInstruments(): Promise<Instrument[]> {
    const cacheKey = CacheService.getDebugKey('zerodha:instruments')
    const cached = await CacheService.get<Instrument[]>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      const response = await fetch(`${this.dataUrl}/instruments`)

      if (!response.ok) {
        throw new Error('Failed to fetch instruments')
      }

      const text = await response.text()
      const lines = text.split('\n')

      // Parse CSV
      const instruments: Instrument[] = []
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',')
        if (parts.length < 10) continue

        instruments.push({
          instrumentToken: parts[0],
          exchangeToken: parts[1],
          tradingSymbol: parts[2],
          name: parts[3],
          lastPrice: parseFloat(parts[4]) || 0,
          expiry: parts[5],
          strikePrice: parseFloat(parts[6]) || 0,
          tickSize: parseFloat(parts[7]) || 0.05,
          lotSize: parseInt(parts[8]) || 1,
          instrumentType: parts[9],
          segment: parts[10] || '',
          exchange: parts[11] || '',
        })
      }

      await CacheService.set(cacheKey, instruments, { ttl: 24 * 60 * 60 })
      return instruments
    } catch (error) {
      console.error('Instruments fetch error:', error)
      throw error
    }
  }

  /**
   * Search for instrument
   */
  async searchInstrument(query: string): Promise<Instrument[]> {
    try {
      const instruments = await this.getInstruments()
      const q = query.toLowerCase()

      return instruments.filter(
        (inst) =>
          inst.tradingSymbol.toLowerCase().includes(q) ||
          inst.name.toLowerCase().includes(q)
      )
    } catch (error) {
      console.error('Instrument search error:', error)
      return []
    }
  }

  /**
   * Get market quotes
   */
  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    try {
      const params = new URLSearchParams({
        i: symbols.join(','),
        mode: 'quote',
      })

      const response = (await this.request(
        `/quote?${params.toString()}`
      )) as ApiResponse<any>

      if (response.status === 'success' && response.data) {
        const quotes: MarketQuote[] = []

        for (const symbol of symbols) {
          const data = response.data[symbol]
          if (data) {
            quotes.push({
              instrumentToken: data.instrument_token,
              tradingSymbol: symbol,
              lastPrice: data.last_price,
              bidPrice: data.depth?.buy?.[0]?.price || 0,
              askPrice: data.depth?.sell?.[0]?.price || 0,
              bidQuantity: data.depth?.buy?.[0]?.quantity || 0,
              askQuantity: data.depth?.sell?.[0]?.quantity || 0,
              dailyHigh: data.ohlc?.high || 0,
              dailyLow: data.ohlc?.low || 0,
              dailyClose: data.ohlc?.close || 0,
              openPrice: data.ohlc?.open || 0,
              volume: data.volume || 0,
              volumeTraded: data.volume_traded || 0,
              change: data.change || 0,
              changePercent: data.change_percent || 0,
              timestamp: new Date(),
            })
          }
        }

        return quotes
      }

      throw new Error('Failed to fetch quotes')
    } catch (error) {
      console.error('Quotes fetch error:', error)
      throw error
    }
  }

  /**
   * Get user orders
   */
  async getOrders(): Promise<Order[]> {
    try {
      const response = (await this.request('/orders')) as ApiResponse<any[]>

      if (response.status === 'success' && response.data) {
        return response.data.map((order) => ({
          id: order.order_id,
          orderId: order.order_id,
          instrumentToken: order.instrument_token,
          tradingSymbol: order.tradingsymbol,
          quantity: order.quantity,
          price: order.price,
          orderType: order.order_type,
          transactionType: order.transaction_type,
          validity: order.validity,
          product: order.product,
          status: order.status,
          filledQuantity: order.filled_quantity,
          pendingQuantity: order.pending_quantity,
          averagePrice: order.average_price,
          exchangeOrderId: order.exchange_order_id,
          exchangeTimestamp: order.exchange_timestamp ? new Date(order.exchange_timestamp) : undefined,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at),
        }))
      }

      throw new Error('Failed to fetch orders')
    } catch (error) {
      console.error('Orders fetch error:', error)
      throw error
    }
  }

  /**
   * Get user positions
   */
  async getPositions(): Promise<Position[]> {
    try {
      const response = (await this.request('/portfolio/positions')) as ApiResponse<any>

      if (response.status === 'success' && response.data) {
        return response.data.day.map((position: any) => ({
          symbol: position.tradingsymbol,
          instrumentToken: position.instrument_token,
          quantity: position.quantity,
          buyQuantity: position.buy_quantity,
          sellQuantity: position.sell_quantity,
          avgPrice: position.avg_price,
          lastPrice: position.last_price,
          buyValue: position.buy_value,
          sellValue: position.sell_value,
          unrealizedProfit: position.unrealised_profit,
          unrealizedProfitPercent: position.unrealised_value,
          realizedProfit: position.realised_profit,
          netValue: position.net_quantity,
          exchange: position.exchange,
          product: position.product,
          multiplier: position.multiplier,
          pnl: position.m2m,
          pnlPercent: ((position.m2m / position.buy_value) * 100) || 0,
          m2m: position.m2m,
          m2mPercent: ((position.m2m / position.buy_value) * 100) || 0,
          netValue2: position.net_value,
          timestamp: new Date(),
        }))
      }

      throw new Error('Failed to fetch positions')
    } catch (error) {
      console.error('Positions fetch error:', error)
      throw error
    }
  }

  /**
   * Get user holdings
   */
  async getHoldings(): Promise<Holding[]> {
    try {
      const response = (await this.request('/portfolio/holdings')) as ApiResponse<any[]>

      if (response.status === 'success' && response.data) {
        return response.data.map((holding: any) => ({
          symbol: holding.tradingsymbol,
          instrumentToken: holding.instrument_token,
          quantity: holding.quantity,
          collateralQuantity: holding.collateral_quantity,
          collateralValue: holding.collateral_value,
          price: holding.last_price,
          lastPrice: holding.last_price,
          pnl: holding.pnl,
          pnlPercent: holding.pnl_percent,
          dayChange: holding.day_change,
          dayChangePercent: holding.day_change_percent,
          exchange: holding.exchange,
          t1Quantity: holding.t1_quantity,
          realisedQuantity: holding.realised_quantity,
          authorisedQuantity: holding.authorised_quantity,
          openQuantity: holding.open_quantity,
          product: holding.product,
        }))
      }

      throw new Error('Failed to fetch holdings')
    } catch (error) {
      console.error('Holdings fetch error:', error)
      throw error
    }
  }

  /**
   * Get complete portfolio
   */
  async getPortfolio(): Promise<Portfolio> {
    try {
      const [profile, positions, holdings] = await Promise.all([
        this.getProfile(),
        this.getPositions(),
        this.getHoldings(),
      ])

      // Fetch margin data
      const marginResponse = (await this.request('/user/margins')) as ApiResponse<any>
      const marginData = marginResponse.data?.equity || {}

      const portfolio: Portfolio = {
        profile,
        equity: {
          used: marginData.used || 0,
          available: marginData.available || 0,
          payin: marginData.payin || 0,
        },
        commodity: {
          used: marginData.commodity_used || 0,
          available: marginData.commodity_available || 0,
          payin: marginData.commodity_payin || 0,
        },
        margin: {
          used: marginData.used || 0,
          available: marginData.available || 0,
          total: (marginData.used || 0) + (marginData.available || 0),
          utilization:
            ((marginData.used || 0) /
              ((marginData.used || 0) + (marginData.available || 0))) *
            100,
        },
        positions,
        holdings,
        dayChange: positions.reduce((sum, p) => sum + p.m2m, 0),
        dayChangePercent:
          ((positions.reduce((sum, p) => sum + p.m2m, 0) /
            positions.reduce((sum, p) => sum + (p.buyValue || 0), 1)) *
            100) ||
          0,
        netChange: 0,
        netChangePercent: 0,
        totalEquity: marginData.used || 0 + (marginData.available || 0),
        timestamp: new Date(),
      }

      return portfolio
    } catch (error) {
      console.error('Portfolio fetch error:', error)
      throw error
    }
  }

  /**
   * Place order
   */
  async placeOrder(orderRequest: OrderRequest): Promise<Order> {
    try {
      const params = new URLSearchParams({
        variety: 'regular',
        exchange: 'NSE',
        tradingsymbol: orderRequest.tradingSymbol,
        transaction_type: orderRequest.transactionType,
        order_type: orderRequest.orderType,
        quantity: orderRequest.quantity.toString(),
        price: orderRequest.price.toString(),
        product: orderRequest.product,
        validity: orderRequest.validity,
        disclosure_quantity: '0',
        trigger_price: '0',
      })

      const response = (await this.request('/orders/regular', {
        method: 'POST',
        body: params,
      })) as ApiResponse<any>

      if (response.status === 'success' && response.data) {
        return {
          id: response.data.order_id,
          orderId: response.data.order_id,
          instrumentToken: orderRequest.instrumentToken,
          tradingSymbol: orderRequest.tradingSymbol,
          quantity: orderRequest.quantity,
          price: orderRequest.price,
          orderType: orderRequest.orderType,
          transactionType: orderRequest.transactionType,
          validity: orderRequest.validity,
          product: orderRequest.product,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      throw new Error(response.error || 'Order placement failed')
    } catch (error) {
      console.error('Order placement error:', error)
      throw error
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        variety: 'regular',
      })

      const response = (await this.request(
        `/orders/${orderId}/cancel?${params.toString()}`,
        { method: 'DELETE' }
      )) as ApiResponse<any>

      if (response.status === 'success') {
        return { status: 'cancelled', orderId }
      }

      throw new Error(response.error || 'Order cancellation failed')
    } catch (error) {
      console.error('Order cancellation error:', error)
      throw error
    }
  }

  /**
   * Get trades
   */
  async getTrades(): Promise<Trade[]> {
    try {
      const response = (await this.request('/trades')) as ApiResponse<any[]>

      if (response.status === 'success' && response.data) {
        return response.data.map((trade: any) => ({
          tradeId: trade.trade_id,
          orderId: trade.order_id,
          instrumentToken: trade.instrument_token,
          tradingSymbol: trade.tradingsymbol,
          transactionType: trade.transaction_type,
          quantity: trade.quantity,
          price: trade.price,
          value: trade.quantity * trade.price,
          commissionValue: trade.commission || 0,
          tax: trade.tax || 0,
          timestamp: new Date(trade.trade_timestamp),
        }))
      }

      throw new Error('Failed to fetch trades')
    } catch (error) {
      console.error('Trades fetch error:', error)
      throw error
    }
  }

  /**
   * Validate order before placement
   */
  validateOrder(order: OrderRequest): boolean {
    if (!order.tradingSymbol || !order.quantity || !order.price) {
      return false
    }

    if (order.quantity <= 0 || order.price <= 0) {
      return false
    }

    if (!['BUY', 'SELL'].includes(order.transactionType)) {
      return false
    }

    if (!['DAY', 'IOC'].includes(order.validity)) {
      return false
    }

    return true
  }

  /**
   * Disconnect (cleanup)
   */
  async disconnect(): Promise<void> {
    this.accessToken = undefined
    this.userId = undefined
  }
}
