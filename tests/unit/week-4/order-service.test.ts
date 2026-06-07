import { describe, it, expect } from 'vitest'
import { orderService } from '@/services/order-service'

describe('Order Service', () => {
  const userId = 'user-123'
  const accountId = 'acc-123'

  it('should create order', async () => {
    const order = await orderService.createOrder(userId, {
      accountId,
      symbol: 'RELIANCE',
      side: 'BUY',
      quantity: 10,
      price: 2650,
    })

    expect(order.id).toBeDefined()
    expect(order.userId).toBe(userId)
    expect(order.symbol).toBe('RELIANCE')
    expect(order.status).toBe('PENDING')
    expect(order.filledQuantity).toBe(0)
  })

  it('should get order by id', async () => {
    const created = await orderService.createOrder(userId, {
      accountId,
      symbol: 'INFY',
      side: 'SELL',
      quantity: 5,
      price: 1500,
    })

    const retrieved = await orderService.getOrderById(created.id)
    expect(retrieved?.id).toBe(created.id)
  })

  it('should get user orders', async () => {
    const user1 = 'user-1'
    const user2 = 'user-2'

    await orderService.createOrder(user1, {
      accountId,
      symbol: 'TCS',
      side: 'BUY',
      quantity: 20,
      price: 3000,
    })

    await orderService.createOrder(user1, {
      accountId,
      symbol: 'WIPRO',
      side: 'SELL',
      quantity: 15,
      price: 400,
    })

    await orderService.createOrder(user2, {
      accountId,
      symbol: 'HDFC',
      side: 'BUY',
      quantity: 5,
      price: 2500,
    })

    const user1Orders = await orderService.getUserOrders(user1)
    const user2Orders = await orderService.getUserOrders(user2)

    expect(user1Orders.length).toBe(2)
    expect(user2Orders.length).toBe(1)
  })

  it('should update order', async () => {
    const order = await orderService.createOrder(userId, {
      accountId,
      symbol: 'AXIS',
      side: 'BUY',
      quantity: 10,
      price: 1000,
    })

    const updated = await orderService.updateOrder(order.id, {
      status: 'OPEN',
      filledQuantity: 5,
      avgFillPrice: 1000,
    })

    expect(updated?.status).toBe('OPEN')
    expect(updated?.filledQuantity).toBe(5)
  })

  it('should cancel order', async () => {
    const order = await orderService.createOrder(userId, {
      accountId,
      symbol: 'MARUTI',
      side: 'BUY',
      quantity: 10,
      price: 8000,
    })

    const cancelled = await orderService.cancelOrder(order.id)
    expect(cancelled?.status).toBe('CANCELLED')
  })

  it('should reject cancelling filled order', async () => {
    const order = await orderService.createOrder(userId, {
      accountId,
      symbol: 'BAJAJ',
      side: 'SELL',
      quantity: 10,
      price: 6000,
    })

    // Fill the order
    await orderService.updateOrder(order.id, {
      status: 'FILLED',
      filledQuantity: 10,
    })

    // Try to cancel
    expect(async () => {
      await orderService.cancelOrder(order.id)
    }).rejects.toThrow()
  })
})
