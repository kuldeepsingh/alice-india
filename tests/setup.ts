import { beforeAll, afterEach, afterAll, vi } from 'vitest'

// Global setup before all tests
beforeAll(async () => {
  console.log('Starting test suite...')

  // Run database migrations before tests
  try {
    const { runMigrations } = await import('../src/services/database.ts')
    await runMigrations()
    console.log('Database migrations completed')
  } catch (error) {
    console.warn('Migration warning:', (error as any)?.message?.substring(0, 100))
  }
})

// Clean up after each test
afterEach(async () => {
  vi.clearAllMocks()
})

// Global teardown after all tests
afterAll(async () => {
  console.log('Test suite complete!')
  
  // Optional: cleanup database after all tests complete
  try {
    const { dbTestUtils } = await import('../src/services/database-test-utils')
    await dbTestUtils.cleanupDatabase()
  } catch (error) {
    // Ignore cleanup errors
  }
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
