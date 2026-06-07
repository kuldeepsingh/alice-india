import { describe, it, expect } from 'vitest'
import { testServer } from '@tests/helpers/test-server'
import { factories } from '@tests/helpers/factories'

describe('Authentication Flow', () => {
  it('should complete full auth flow: register -> login', async () => {
    const user = factories.user({ email: 'flowtest@example.com' })

    // Step 1: Register
    const registerRes = await testServer.request()
      .post('/auth/register')
      .send(user)

    expect(registerRes.status).toBe(201)
    const userId = registerRes.body.id

    // Step 2: Login
    const loginRes = await testServer.request()
      .post('/auth/login')
      .send(user)

    expect(loginRes.status).toBe(200)
    expect(loginRes.body.token).toBeDefined()
    expect(loginRes.body.refreshToken).toBeDefined()
    const { token } = loginRes.body

    // Verify credentials are correct
    expect(userId).toBeDefined()
    expect(token).toBeDefined()
    expect(loginRes.body.user.email).toBe(user.email)
  })
})
