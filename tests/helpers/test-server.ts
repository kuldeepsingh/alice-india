import { createApp } from '../../src/app.ts'
import request from 'supertest'

export const testServer = {
  request() {
    const app = createApp()
    return request(app)
  },
}
