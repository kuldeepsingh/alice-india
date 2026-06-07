import { describe, it, expect } from 'vitest'
import { testServer } from '@tests/helpers/test-server'
import { factories } from '@tests/helpers/factories'

describe('Market Data Flow', () => {
  it('should complete full market data flow', async () => {
    const user = factories.user({ email: 'flowtest@example.com' })

    // Step 1: Register and login
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    // Step 2: Get public quotes
    const quoteRes = await testServer.request()
      .get('/market/quote/RELIANCE')

    expect(quoteRes.status).toBe(200)
    expect(quoteRes.body.lastPrice).toBeGreaterThan(0)

    // Step 3: Subscribe to prices
    const subRes = await testServer.request()
      .post('/market/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ symbols: ['RELIANCE', 'INFY', 'TCS'] })

    expect(subRes.status).toBe(201)
    const subId = subRes.body.id

    // Step 4: Get subscriptions
    const listRes = await testServer.request()
      .get('/market/subscriptions')
      .set('Authorization', `Bearer ${token}`)

    expect(listRes.status).toBe(200)
    expect(listRes.body.length).toBeGreaterThan(0)

    // Step 5: Update subscription
    const updateRes = await testServer.request()
      .put(`/market/subscriptions/${subId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ symbols: ['HDFC', 'ICICIBANK'] })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body.symbols.length).toBe(2)

    // Step 6: Delete subscription
    const deleteRes = await testServer.request()
      .delete(`/market/subscriptions/${subId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(deleteRes.status).toBe(204)
  })
})
