/**
 * Order Service
 * Order management, validation, and risk controls
 * 
 * Now integrates with key retrieval service to fetch Zerodha credentials
 * from secure backend storage instead of using hardcoded keys.
 */

import { query } from './database.ts'
import { notificationService } from './notification-service.ts'
import { logger } from './logger.ts'
import { keyRetrievalService } from './key-retrieval-service.ts'
import { ZerodhaService } from './zerodha-service.ts'
import {
  Order,
  OrderRequest,
  OrderStatus,
  RiskLimits,
  RiskCheck,
} from '../models/trading.ts'

export class OrderService {
  private defaultRiskLimits: any = {
    dailyLossLimit: -50000,
    positionSizeLimit: 1000000,
    maxQuantityPerOrder: 5000,
    maxMarginUtilization: 0.8,
    stopLossPercent: 0.05,
  }

  constructor() {
    // No longer need zerodhaService passed in - we'll fetch credentials dynamically
  }

  /**
   * Create and place an order
   * 
   * Fetches Zerodha credentials from secure backend storage
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

      // Fetch Zerodha credentials from backend
      logger.debug({
        type: 'fetching_zerodha_credentials',
        userId,
      })

      const zerodhaCredentials = await keyRetrievalService.getZerodhaCredentials(userId)
      if (!zerodhaCredentials || !zerodhaCredentials.key || !zerodhaCredentials.secret) {
        throw new Error('Zerodha credentials not configured. Please configure in Settings.')
      }

      // Create Zerodha service with fetched credentials
      const zerodhaService = new ZerodhaService(
        zerodhaCredentials.key,
        zerodhaCredentials.secret
      )

      // Place order with Zerodha
      const order = await zerodhaService.placeOrder(orderRequest)

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
        type: 'order_placed_successfully',
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
        sql += ` AND symbol = $${paramCount}`
        params.push(filters.symbol)
        paramCount++
      }

      if (filters?.status) {
        sql += ` AND status = $${paramCount}`
        params.push(filters.status)
        paramCount++
      }

      sql += ' ORDER BY created_at DESC'

      if (filters?.limit) {
        sql += ` LIMIT $${paramCount}`
        params.push(filters.limit)
        paramCount++
      }

      if (filters?.offset) {
        sql += ` OFFSET $${paramCount}`
        params.push(filters.offset)
      }

      const result = await query(sql, params)
      return result.rows
    } catch (error) {
      logger.error({
        type: 'get_orders_error',
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(userId: string, orderId: string): Promise<boolean> {
    try {
      // Fetch Zerodha credentials
      const zerodhaCredentials = await keyRetrievalService.getZerodhaCredentials(userId)
      if (!zerodhaCredentials) {
        throw new Error('Zerodha credentials not configured')
      }

      const zerodhaService = new ZerodhaService(
        zerodhaCredentials.key,
        zerodhaCredentials.secret
      )

      // Cancel order
      await zerodhaService.cancelOrder(orderId)

      // Update database
      await query(
        'UPDATE trading_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
        ['CANCELLED', orderId, userId]
      )

      logger.info({
        type: 'order_cancelled',
        userId,
        orderId,
      })

      return true
    } catch (error) {
      logger.error({
        type: 'cancel_order_error',
        userId,
        orderId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Validate order
   */
  private async validateOrder(orderRequest: OrderRequest): Promise<{ isValid: boolean; reason?: string }> {
    if (!orderRequest.symbol || orderRequest.symbol.trim().length === 0) {
      return { isValid: false, reason: 'Symbol is required' }
    }

    if (!orderRequest.side || !['BUY', 'SELL'].includes(orderRequest.side)) {
      return { isValid: false, reason: 'Invalid side. Must be BUY or SELL' }
    }

    if (!orderRequest.quantity || orderRequest.quantity <= 0) {
      return { isValid: false, reason: 'Quantity must be positive' }
    }

    if (!orderRequest.price || orderRequest.price <= 0) {
      return { isValid: false, reason: 'Price must be positive' }
    }

    return { isValid: true }
  }

  /**
   * Check risk limits
   */
  private async checkRiskLimits(
    userId: string,
    orderRequest: OrderRequest
  ): Promise<RiskCheck> {
    try {
      // Get user's existing positions
      const orders = await this.getOrders(userId, { status: 'FILLED' })

      // Calculate total exposure
      const totalExposure = orders.reduce((sum, order) => {
        const side = order.transaction_type === 'BUY' ? 1 : -1
        return sum + order.quantity * order.price * side
      }, 0)

      // Check limits
      const orderValue = orderRequest.quantity * orderRequest.price
      if (totalExposure + orderValue > this.defaultRiskLimits.positionSizeLimit) {
        return {
          isValid: false,
          reason: 'Position size exceeds limit',
        }
      }

      if (orderRequest.quantity > this.defaultRiskLimits.maxQuantityPerOrder) {
        return {
          isValid: false,
          reason: `Quantity exceeds max ${this.defaultRiskLimits.maxQuantityPerOrder}`,
        }
      }

      return { isValid: true }
    } catch (error) {
      logger.error({
        type: 'risk_check_error',
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      // If risk check fails, fail safely
      return { isValid: false, reason: 'Risk check error' }
    }
  }

  /**
   * Notify order placed
   */
  private async notifyOrderPlaced(order: any): Promise<void> {
    try {
      await notificationService.sendOrderNotification(order.user_id, {
        type: 'ORDER_PLACED',
        orderId: order.id,
        symbol: order.symbol,
        quantity: order.quantity,
        price: order.price,
        message: `Order placed: ${order.quantity} ${order.symbol} @ ${order.price}`,
      })
    } catch (error) {
      logger.warn({
        type: 'notification_send_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      // Don't fail the order if notification fails
    }
  }
}
