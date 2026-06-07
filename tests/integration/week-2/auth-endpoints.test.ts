import { describe, it, expect } from 'vitest'
import { testServer } from '@tests/helpers/test-server'
import { factories } from '@tests/helpers/factories'

describe('Auth Endpoints', () => {
  it('should register new user', async () => {
    const user = factories.user({ email: 'newuser@example.com' })
    const res = await testServer.request()
      .post('/auth/register')
      .send(user)

    expect(res.status).toBe(201)
    expect(res.body.email).toBe('newuser@example.com')
    expect(res.body.id).toBeDefined()
    expect(res.body.role).toBe('trader')
    expect(res.body).not.toHaveProperty('password_hash')
  })

  it('should reject duplicate email', async () => {
    const user = factories.user({ email: 'duplicate@example.com' })

    // First registration
    await testServer.request()
      .post('/auth/register')
      .send(user)

    // Second registration with same email
    const res = await testServer.request()
      .post('/auth/register')
      .send(user)

    expect(res.status).toBe(409)
    expect(res.body.error).toContain('already registered')
  })

  it('should validate email format', async () => {
    const res = await testServer.request()
      .post('/auth/register')
      .send({ 
        email: 'invalid-email', 
        password: 'validpassword123' 
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('should validate password length', async () => {
    const res = await testServer.request()
      .post('/auth/register')
      .send({ email: 'test@example.com', password: '123' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('should login with valid credentials', async () => {
    const user = factories.user({ email: 'login@example.com' })

    // Register
    await testServer.request()
      .post('/auth/register')
      .send(user)

    // Login
    const res = await testServer.request()
      .post('/auth/login')
      .send(user)

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.refreshToken).toBeDefined()
    expect(res.body.user.email).toBe(user.email)
  })

  it('should reject invalid credentials', async () => {
    const res = await testServer.request()
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBeDefined()
  })
})
