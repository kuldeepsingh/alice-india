import { describe, it, expect } from 'vitest'
import { testServer } from '@tests/helpers/test-server'
import { factories } from '@tests/helpers/factories'

describe('User Registration', () => {
  it('should register new user', async () => {
    const user = factories.user({ email: 'newuser@example.com' })
    const res = await testServer.request()
      .post('/users/register')
      .send(user)

    expect(res.status).toBe(201)
    expect(res.body.email).toBe('newuser@example.com')
    expect(res.body.id).toBeDefined()
  })

  it('should accept valid registration data', async () => {
    const user = factories.user()
    const res = await testServer.request()
      .post('/users/register')
      .send(user)

    expect(res.status).toBe(201)
    expect(res.body.role).toBe('trader')
  })

  it('should return user data', async () => {
    const user = factories.user()
    const res = await testServer.request()
      .post('/users/register')
      .send(user)

    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('email')
    expect(res.body).toHaveProperty('role')
    expect(res.body).toHaveProperty('created_at')
  })
})
