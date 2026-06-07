import { describe, it, expect } from 'vitest'
import { testServer } from '@tests/helpers/test-server'
import { factories } from '@tests/helpers/factories'

describe('Order Management Flow', () => {
  it('should complete full order management flow', async () => {
    const user = factories.user({ email: 'flowtest@example.com' })

    // Register and login
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    // Create account
    const accRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Primary Trading Account' })

    const accountId = accRes.body.id

    // Create order
    const createRes = await testServer.request()
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId,
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: 10,
        price: 2650,
      })

    expect(createRes.status).toBe(201)
    const orderId = createRes.body.id

    // List orders
    const listRes = await testServer.request()
      .get('/orders')
      .set('Authorization', `Bearer ${token}`)

    expect(listRes.status).toBe(200)
    expect(listRes.body.length).toBeGreaterThan(0)

    // Get specific order
    const getRes = await testServer.request()
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(getRes.status).toBe(200)
    expect(getRes.body.id).toBe(orderId)

    // Update order status
    const updateRes = await testServer.request()
      .put(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'OPEN', filledQuantity: 5, avgFillPrice: 2650 })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body.status).toBe('OPEN')
    expect(updateRes.body.filledQuantity).toBe(5)

    // Cancel order
    const cancelRes = await testServer.request()
      .post(`/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${token}`)

    expect(cancelRes.status).toBe(200)
    expect(cancelRes.body.status).toBe('CANCELLED')
  })
})
