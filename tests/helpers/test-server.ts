import { createApp } from '../../src/app.ts'
import request from 'supertest'

// Create test request wrapper that automatically handles API versioning
class TestRequest {
  private baseRequest: any
  private versionPrefix = '/api/v1'

  constructor(app: any) {
    this.baseRequest = request(app)
  }

  get(path: string) {
    // Add /api/v1 prefix if not already present
    const fullPath = path.startsWith('/health') || path.startsWith('/api') ? path : this.versionPrefix + path
    return this.baseRequest.get(fullPath)
  }

  post(path: string) {
    const fullPath = path.startsWith('/health') || path.startsWith('/api') ? path : this.versionPrefix + path
    return this.baseRequest.post(fullPath)
  }

  put(path: string) {
    const fullPath = path.startsWith('/health') || path.startsWith('/api') ? path : this.versionPrefix + path
    return this.baseRequest.put(fullPath)
  }

  delete(path: string) {
    const fullPath = path.startsWith('/health') || path.startsWith('/api') ? path : this.versionPrefix + path
    return this.baseRequest.delete(fullPath)
  }
}

export const testServer = {
  request() {
    const app = createApp()
    return new TestRequest(app) as any
  },
}
