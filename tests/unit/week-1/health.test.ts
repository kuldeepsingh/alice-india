import { describe, it, expect } from 'vitest'
import { createApp } from '@/app'
import request from 'supertest'

describe('Health Checks', () => {
  it('should return alive status', async () => {
    const app = createApp()
    const res = await request(app).get('/health/live')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('status', 'alive')
    expect(res.body).toHaveProperty('timestamp')
  })

  it('should return ready status', async () => {
    const app = createApp()
    const res = await request(app).get('/health/ready')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('status', 'ready')
  })

  it('should return 404 for unknown routes', async () => {
    const app = createApp()
    const res = await request(app).get('/unknown-route')

    expect(res.status).toBe(404)
  })
})
