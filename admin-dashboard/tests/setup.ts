import { vi, beforeAll, afterAll, afterEach } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

beforeAll(() => {
  console.log('Testing Alice Admin Dashboard...')
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  console.log('Tests completed!')
})
