import { describe, it, expect } from 'vitest'
import { testServer } from '@tests/helpers/test-server'
import { factories } from '@tests/helpers/factories'

describe('Order Endpoints', () => {
  it('should require authentication', async () => {
    const res = await testServer.request()
      .post('/orders')
      .send({
        accountId: 'acc-123',
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: 10,
        price: 2650,
      })

    expect(res.status).toBe(401)
  })

  it('should create order', async () => {
    const user = factories.user({ email: 'ord1@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const accRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Trading' })

    const res = await testServer.request()
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId: accRes.body.id,
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: 10,
        price: 2650,
      })

    expect(res.status).toBe(201)
    expect(res.body.symbol).toBe('RELIANCE')
    expect(res.body.status).toBe('PENDING')
  })

  it('should list user orders', async () => {
    const user = factories.user({ email: 'ord2@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const accRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Trading' })

    await testServer.request()
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId: accRes.body.id,
        symbol: 'INFY',
        side: 'SELL',
        quantity: 5,
        price: 1500,
      })

    const res = await testServer.request()
      .get('/orders')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('should get specific order', async () => {
    const user = factories.user({ email: 'ord3@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const accRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Trading' })

    const createRes = await testServer.request()
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId: accRes.body.id,
        symbol: 'TCS',
        side: 'BUY',
        quantity: 20,
        price: 3000,
      })

    const res = await testServer.request()
      .get(`/orders/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.symbol).toBe('TCS')
  })

  it('should update order', async () => {
    const user = factories.user({ email: 'ord4@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const accRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Trading' })

    const createRes = await testServer.request()
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId: accRes.body.id,
        symbol: 'WIPRO',
        side: 'SELL',
        quantity: 15,
        price: 400,
      })

    const res = await testServer.request()
      .put(`/orders/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'OPEN', filledQuantity: 10 })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('OPEN')
  })

  it('should cancel order', async () => {
    const user = factories.user({ email: 'ord5@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const accRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Trading' })

    const createRes = await testServer.request()
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId: accRes.body.id,
        symbol: 'HDFC',
        side: 'BUY',
        quantity: 5,
        price: 2500,
      })

    const res = await testServer.request()
      .post(`/orders/${createRes.body.id}/cancel`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('CANCELLED')
  })

  it('should prevent access to other users orders', async () => {
    const user1 = factories.user({ email: 'user1@ord.com' })
    const user2 = factories.user({ email: 'user2@ord.com' })

    await testServer.request().post('/auth/register').send(user1)
    await testServer.request().post('/auth/register').send(user2)

    const login1 = await testServer.request().post('/auth/login').send(user1)
    const login2 = await testServer.request().post('/auth/login').send(user2)

    const accRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${login1.body.token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Private' })

    const createRes = await testServer.request()
      .post('/orders')
      .set('Authorization', `Bearer ${login1.body.token}`)
      .send({
        accountId: accRes.body.id,
        symbol: 'AXISBANK',
        side: 'BUY',
        quantity: 10,
        price: 1000,
      })

    const res = await testServer.request()
      .get(`/orders/${createRes.body.id}`)
      .set('Authorization', `Bearer ${login2.body.token}`)

    expect(res.status).toBe(403)
  })
})
