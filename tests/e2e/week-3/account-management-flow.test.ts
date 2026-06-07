import { describe, it, expect } from 'vitest'
import { testServer } from '@tests/helpers/test-server'
import { factories } from '@tests/helpers/factories'

describe('Account Management Flow', () => {
  it('should complete full account management flow', async () => {
    const user = factories.user({ email: 'flow@example.com' })

    await testServer.request().post('/auth/register').send(user)
    const loginRes = await testServer.request().post('/auth/login').send(user)
    const token = loginRes.body.token

    const createRes = await testServer.request()
      .post('/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({ brokerType: 'zerodha', accountLabel: 'Primary' })

    expect(createRes.status).toBe(201)
    const accountId = createRes.body.id

    const listRes = await testServer.request()
      .get('/accounts')
      .set('Authorization', `Bearer ${token}`)
    expect(listRes.status).toBe(200)

    const getRes = await testServer.request()
      .get(`/accounts/${accountId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getRes.status).toBe(200)

    const updateRes = await testServer.request()
      .put(`/accounts/${accountId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ accountLabel: 'Updated Primary' })
    expect(updateRes.status).toBe(200)
  })
})
