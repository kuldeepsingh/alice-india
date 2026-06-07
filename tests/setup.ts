import { beforeAll, afterAll, afterEach, vi } from 'vitest'

beforeAll(async () => {
  console.log('Starting test suite...')
})

afterEach(async () => {
  vi.clearAllMocks()
})

afterAll(async () => {
  console.log('Test suite complete!')
})

// Suppress logs during tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
