import { describe, it, expect } from 'vitest'
import { testServer } from '@tests/helpers/test-server'
import { factories } from '@tests/helpers/factories'

describe('Account Endpoints', () => {
  it('should require authentication', async () => {
    const res = await testServer.request()
      .post('/accounts')
      .send({ brokerType: 'zerodha', accountLabel: 'Test' })

    expect(res.status).toBe(401)
  })

  it('should create account when authenticated', async () => {
    const user = factories.user({ email: 'acc1@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const res = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'My Account' })

    expect(res.status).toBe(201)
    expect(res.body.brokerType).toBe('zerodha')
  })

  it('should list accounts', async () => {
    const user = factories.user({ email: 'acc2@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const res = await testServer.request()
      .get('/accounts')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('should get specific account', async () => {
    const user = factories.user({ email: 'acc3@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const createRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Test' })

    const res = await testServer.request()
      .get(`/accounts/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('should update account', async () => {
    const user = factories.user({ email: 'acc4@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const createRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Original' })

    const res = await testServer.request()
      .put(`/accounts/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ accountLabel: 'Updated' })

    expect(res.status).toBe(200)
    expect(res.body.accountLabel).toBe('Updated')
  })

  it('should delete account', async () => {
    const user = factories.user({ email: 'acc5@example.com' })
    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const createRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Delete Me' })

    const res = await testServer.request()
      .delete(`/accounts/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })

  it('should prevent access to other users accounts', async () => {
    const user1 = factories.user({ email: 'user1@ex.com' })
    const user2 = factories.user({ email: 'user2@ex.com' })

    await testServer.request().post('/auth/register').send(user1)
    await testServer.request().post('/auth/register').send(user2)

    const login1 = await testServer.request().post('/auth/login').send(user1)
    const login2 = await testServer.request().post('/auth/login').send(user2)

    const createRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${login1.body.token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Private' })

    const res = await testServer.request()
      .get(`/accounts/${createRes.body.id}`)
      .set('Authorization', `Bearer ${login2.body.token}`)

    expect(res.status).toBe(403)
  })
})
