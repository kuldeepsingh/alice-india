import { v4 as uuidv4 } from 'uuid'
import { logger } from './logger.ts'
import { query } from './database.ts'

export interface Order {
  id: string
  user_id: string
  account_id: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  status: string
  filled_quantity: number
  avg_fill_price: number
  broker_order_id?: string
  created_at: string
  updated_at: string
}

export interface CreateOrderRequest {
  accountId: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
}

export interface UpdateOrderRequest {
  quantity?: number
  price?: number
  status?: string
  filledQuantity?: number
  avgFillPrice?: number
}

export const orderService = {
  async createOrder(userId: string, request: CreateOrderRequest): Promise<Order> {
    if (!request.accountId || !request.symbol || !request.side || !request.quantity || request.price === undefined) {
      throw new Error('Missing required fields')
    }

    if (!['BUY', 'SELL'].includes(request.side)) {
      throw new Error('Invalid side')
    }

    if (request.quantity <= 0 || request.price <= 0) {
      throw new Error('Quantity and price must be positive')
    }

    const id = uuidv4()
    const now = new Date().toISOString()

    const result = await query(
      'INSERT INTO orders (id, user_id, account_id, symbol, side, quantity, price, status, filled_quantity, avg_fill_price, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [id, userId, request.accountId, request.symbol, request.side, request.quantity, request.price, 'PENDING', 0, 0, now, now]
    )

    logger.info({
      type: 'order_created',
      orderId: id,
      userId,
      symbol: request.symbol,
    })

    return result.rows[0]
  },

  async getOrderById(id: string): Promise<Order | null> {
    const result = await query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    const result = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    return result.rows
  },

  async getAccountOrders(accountId: string): Promise<Order[]> {
    const result = await query(
      'SELECT * FROM orders WHERE account_id = $1 ORDER BY created_at DESC',
      [accountId]
    )
    return result.rows
  },

  async updateOrder(id: string, request: UpdateOrderRequest): Promise<Order | null> {
    const now = new Date().toISOString()

    const result = await query(
      'UPDATE orders SET quantity = COALESCE($1, quantity), price = COALESCE($2, price), status = COALESCE($3, status), filled_quantity = COALESCE($4, filled_quantity), avg_fill_price = COALESCE($5, avg_fill_price), updated_at = $6 WHERE id = $7 RETURNING *',
      [request.quantity, request.price, request.status, request.filledQuantity, request.avgFillPrice, now, id]
    )

    if (result.rows.length === 0) {
      return null
    }

    logger.info({
      type: 'order_updated',
      orderId: id,
    })

    return result.rows[0]
  },

  async cancelOrder(id: string): Promise<Order | null> {
    const order = await this.getOrderById(id)
    if (!order) {
      return null
    }

    if (!['PENDING', 'OPEN'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status ${order.status}`)
    }

    const now = new Date().toISOString()

    const result = await query(
      'UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      ['CANCELLED', now, id]
    )

    logger.info({
      type: 'order_cancelled',
      orderId: id,
    })

    return result.rows[0]
  },
}
