import { v4 as uuidv4 } from 'uuid'
import { logger } from './logger.ts'

export interface Order {
  id: string
  userId: string
  accountId: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  status: 'PENDING' | 'OPEN' | 'FILLED' | 'PARTIAL' | 'CANCELLED' | 'REJECTED'
  filledQuantity: number
  avgFillPrice: number
  brokerOrderId?: string
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
  status?: Order['status']
  filledQuantity?: number
  avgFillPrice?: number
}

// In-memory storage (will be replaced with database)
const orders: Map<string, Order> = new Map()

export const orderService = {
  async createOrder(
    userId: string,
    request: CreateOrderRequest
  ): Promise<Order> {
    logger.info({
      type: 'order_creation_start',
      userId,
      symbol: request.symbol,
      side: request.side,
    })

    // Validation
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

    const order: Order = {
      id,
      userId,
      accountId: request.accountId,
      symbol: request.symbol,
      side: request.side,
      quantity: request.quantity,
      price: request.price,
      status: 'PENDING',
      filledQuantity: 0,
      avgFillPrice: 0,
      created_at: now,
      updated_at: now,
    }

    orders.set(id, order)

    logger.info({
      type: 'order_created',
      orderId: id,
      userId,
      symbol: request.symbol,
    })

    return order
  },

  async getOrderById(id: string): Promise<Order | null> {
    return orders.get(id) || null
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(orders.values()).filter(o => o.userId === userId)
  },

  async getAccountOrders(accountId: string): Promise<Order[]> {
    return Array.from(orders.values()).filter(o => o.accountId === accountId)
  },

  async updateOrder(
    id: string,
    request: UpdateOrderRequest
  ): Promise<Order | null> {
    const order = orders.get(id)
    if (!order) {
      return null
    }

    const now = new Date().toISOString()
    const updated: Order = {
      ...order,
      quantity: request.quantity ?? order.quantity,
      price: request.price ?? order.price,
      status: request.status ?? order.status,
      filledQuantity: request.filledQuantity ?? order.filledQuantity,
      avgFillPrice: request.avgFillPrice ?? order.avgFillPrice,
      updated_at: now,
    }

    orders.set(id, updated)

    logger.info({
      type: 'order_updated',
      orderId: id,
      status: updated.status,
    })

    return updated
  },

  async cancelOrder(id: string): Promise<Order | null> {
    const order = orders.get(id)
    if (!order) {
      return null
    }

    // Can only cancel pending or open orders
    if (!['PENDING', 'OPEN'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status ${order.status}`)
    }

    const now = new Date().toISOString()
    const updated: Order = {
      ...order,
      status: 'CANCELLED',
      updated_at: now,
    }

    orders.set(id, updated)

    logger.info({
      type: 'order_cancelled',
      orderId: id,
    })

    return updated
  },

  async getAllOrders(): Promise<Order[]> {
    return Array.from(orders.values())
  },
}
