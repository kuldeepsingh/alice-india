/**
 * Order Service
 * Order management, validation, and risk controls
 */

import { query } from './database.ts'
import { notificationService } from './notification-service.ts'
import { logger } from './logger.ts'
import {
  Order,
  OrderRequest,
  OrderStatus,
  RiskLimits,
  RiskCheck,
} from '../models/trading.ts'

export class OrderService {
  private zerodhaService: any | null = null
  private defaultRiskLimits: any = {
    dailyLossLimit: -50000,
    positionSizeLimit: 1000000,
    maxQuantityPerOrder: 5000,
    maxMarginUtilization: 0.8,
    stopLossPercent: 0.05,
  }

  constructor(zerodhaService?: any) {
    this.zerodhaService = zerodhaService || null
  }

  /**
   * Create and place an order
   */
  async createOrder(
    userId: string,
    orderRequest: OrderRequest
  ): Promise<Order> {
    try {
      // Validate order
      const validation = await this.validateOrder(orderRequest)
      if (!validation.isValid) {
        throw new Error(validation.reason || 'Order validation failed')
      }

      // Check risk limits
      const riskCheck = await this.checkRiskLimits(userId, orderRequest)
      if (!riskCheck.isValid) {
        throw new Error(riskCheck.reason || 'Risk limits exceeded')
      }

      // Place order with Zerodha
      if (!this.zerodhaService) {
        throw new Error('Zerodha service not configured')
      }

      const order = await this.zerodhaService.placeOrder(orderRequest)

      // Store in database
      const sqlInsert = `
        INSERT INTO trading_orders (
          user_id, zerodha_order_id, symbol, quantity, price,
          order_type, transaction_type, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `

      const result = await query(sqlInsert, [
        userId,
        order.orderId,
        order.tradingSymbol,
        order.quantity,
        order.price,
        order.orderType,
        order.transactionType,
        order.status,
      ])

      const storedOrder = result.rows[0]

      // Notify order placed
      await this.notifyOrderPlaced(storedOrder)

      // Log order placed
      logger.info({
        type: 'order_placed',
        userId,
        orderId: storedOrder.id,
        symbol: order.tradingSymbol,
        quantity: order.quantity,
        price: order.price,
      })

      return storedOrder
    } catch (error: any) {
      logger.error({
        type: 'order_creation_error',
        userId,
        error: error.message,
      })

      throw error
    }
  }

  /**
   * Get user orders
   */
  async getOrders(
    userId: string,
    filters?: {
      symbol?: string
      status?: OrderStatus
      limit?: number
      offset?: number
    }
  ): Promise<Order[]> {
    try {
      let sql = 'SELECT * FROM trading_orders WHERE user_id = $1'
      const params: any[] = [userId]
      let paramCount = 2

      if (filters?.symbol) {
        sql += ` AND symbol = $${paramCount++}`
        params.push(filters.symbol)
      }

      if (filters?.status) {
        sql += ` AND status = $${paramCount++}`
        params.push(filters.status)
      }

      sql += ` ORDER BY created_at DESC`

      if (filters?.limit) {
        sql += ` LIMIT $${paramCount++}`
        params.push(filters.limit)
      }

      if (filters?.offset) {
        sql += ` OFFSET $${paramCount++}`
        params.push(filters.offset)
      }

      const result = await query(sql, params)
      return result.rows
    } catch (error) {
      console.error('Get orders error:', error)
      throw error
    }
  }

  /**
   * Validate order before placement
   */
  async validateOrder(order: OrderRequest): Promise<{ isValid: boolean; reason?: string }> {
    try {
      if (!order.tradingSymbol || !order.quantity || !order.price) {
        return { isValid: false, reason: 'Missing required fields' }
      }

      if (order.quantity <= 0 || order.price <= 0) {
        return { isValid: false, reason: 'Quantity and price must be positive' }
      }

      if (order.quantity > this.defaultRiskLimits.maxQuantityPerOrder) {
        return {
          isValid: false,
          reason: `Quantity exceeds limit of ${this.defaultRiskLimits.maxQuantityPerOrder}`,
        }
      }

      if (!['BUY', 'SELL'].includes(order.transactionType)) {
        return { isValid: false, reason: 'Invalid transaction type' }
      }

      if (!['REGULAR', 'BRACKET', 'COVER'].includes(order.orderType)) {
        return { isValid: false, reason: 'Invalid order type' }
      }

      if (!['DAY', 'IOC'].includes(order.validity)) {
        return { isValid: false, reason: 'Invalid validity' }
      }

      if (!['MIS', 'CNC', 'NRML'].includes(order.product)) {
        return { isValid: false, reason: 'Invalid product' }
      }

      return { isValid: true }
    } catch (error) {
      console.error('Validation error:', error)
      return { isValid: false, reason: 'Validation error' }
    }
  }

  /**
   * Check risk limits before order
   */
  async checkRiskLimits(
    userId: string,
    order: OrderRequest
  ): Promise<RiskCheck> {
    try {
      if (!this.zerodhaService) {
        return { isValid: true }
      }

      const portfolio = await this.zerodhaService.getPortfolio()
      const requiredMargin = order.price * order.quantity * 0.20
      const availableMargin = portfolio.margin.available

      if (requiredMargin > availableMargin) {
        return {
          isValid: false,
          reason: 'Insufficient margin',
          requiredMargin,
          availableMargin,
        }
      }

      const newUtilization = (portfolio.margin.used + requiredMargin) / portfolio.margin.total

      if (newUtilization > this.defaultRiskLimits.maxMarginUtilization) {
        return {
          isValid: false,
          reason: 'Margin utilization limit exceeded',
          currentMargin: portfolio.margin.used,
          availableMargin,
        }
      }

      const dayPnL = portfolio.positions.reduce((sum, p) => sum + p.m2m, 0)

      if (dayPnL < this.defaultRiskLimits.dailyLossLimit) {
        return {
          isValid: false,
          reason: 'Daily loss limit exceeded',
        }
      }

      return { isValid: true }
    } catch (error) {
      console.error('Risk check error:', error)
      return { isValid: true }
    }
  }

  /**
   * Order placed notification
   */
  async notifyOrderPlaced(order: any): Promise<void> {
    try {
      await NotificationService.sendNotification({
        userId: order.user_id,
        type: 'order_placed' as any,
        title: `Order Placed: ${order.symbol}`,
        message: `${order.transaction_type} ${order.quantity} ${order.symbol} @ ₹${order.price}`,
      })
    } catch (error) {
      console.error('Notification error:', error)
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(userId: string): Promise<any> {
    try {
      const sql = `
        SELECT
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_orders,
          COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_orders
        FROM trading_orders
        WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE
      `

      const result = await query(sql, [userId])
      return result.rows[0] || {}
    } catch (error) {
      console.error('Order stats error:', error)
      throw error
    }
  }
}
