import { describe, it, expect } from 'vitest'
import { testServer } from '@tests/helpers/test-server'
import { factories } from '@tests/helpers/factories'

describe('Market Data Endpoints', () => {
  it('should get quote without auth', async () => {
    const res = await testServer.request()
      .get('/market/quote/RELIANCE')

    expect(res.status).toBe(200)
    expect(res.body.symbol).toBe('RELIANCE')
    expect(res.body.lastPrice).toBeGreaterThan(0)
  })

  it('should get multiple quotes', async () => {
    const res = await testServer.request()
      .post('/market/quotes')
      .send({ symbols: ['INFY', 'TCS'] })

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(2)
  })

  it('should create subscription with auth', async () => {
    const user = factories.user({ email: 'market1@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const res = await testServer.request()
      .post('/market/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ symbols: ['RELIANCE', 'INFY'] })

    expect(res.status).toBe(201)
    expect(res.body.symbols.length).toBe(2)
    expect(res.body.status).toBe('active')
  })

  it('should get user subscriptions', async () => {
    const user = factories.user({ email: 'market2@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    // Create subscription
    await testServer.request()
      .post('/market/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ symbols: ['HDFC'] })

    // Get subscriptions
    const res = await testServer.request()
      .get('/market/subscriptions')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('should update subscription', async () => {
    const user = factories.user({ email: 'market3@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const createRes = await testServer.request()
      .post('/market/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ symbols: ['RELIANCE'] })

    const subId = createRes.body.id

    const res = await testServer.request()
      .put(`/market/subscriptions/${subId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ symbols: ['INFY', 'TCS'] })

    expect(res.status).toBe(200)
    expect(res.body.symbols.length).toBe(2)
  })

  it('should delete subscription', async () => {
    const user = factories.user({ email: 'market4@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const createRes = await testServer.request()
      .post('/market/subscribe')
      .set('Authorization', `Bearer ${token}`)
      .send({ symbols: ['RELIANCE'] })

    const subId = createRes.body.id

    const res = await testServer.request()
      .delete(`/market/subscriptions/${subId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })
})
