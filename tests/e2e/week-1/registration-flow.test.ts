import { describe, it, expect } from 'vitest'
import { testServer } from '@tests/helpers/test-server'
import { factories } from '@tests/helpers/factories'

describe('Registration Flow', () => {
  it('should complete full registration flow', async () => {
    const user = factories.user({ email: 'flow@example.com' })

    // Step 1: Register user
    const registerRes = await testServer.request()
      .post('/users/register')
      .send(user)

    expect(registerRes.status).toBe(201)
    expect(registerRes.body.email).toBe('flow@example.com')
    const userId = registerRes.body.id

    // Step 2: Verify user was created
    expect(userId).toBeDefined()

    // Step 3: Verify response has all fields
    expect(registerRes.body).toHaveProperty('id')
    expect(registerRes.body).toHaveProperty('role', 'trader')
    expect(registerRes.body).toHaveProperty('created_at')
  })
})
