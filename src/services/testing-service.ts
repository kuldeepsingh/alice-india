/**
 * Testing Service
 * Comprehensive backend testing and diagnostics
 */

import { query } from './database.ts'
import { CredentialService } from './credential-service.ts'
import { ZerodhaService } from './zerodha-service.ts'
import { CacheService } from './cache-service.ts'

export interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  duration: number
  message?: string
  error?: string
}

export interface TestSuiteResult {
  timestamp: Date
  totalTests: number
  passed: number
  failed: number
  skipped: number
  duration: number
  results: TestResult[]
}

export class TestingService {
  /**
   * Run all tests
   */
  static async runAllTests(userId: string): Promise<TestSuiteResult> {
    const startTime = Date.now()
    const results: TestResult[] = []

    // Database Tests
    results.push(await this.testDatabaseConnection())
    results.push(await this.testDatabaseTables())
    results.push(await this.testDatabaseIndexes())

    // Credential Tests
    results.push(await this.testCredentialEncryption())
    results.push(await this.testCredentialStorage(userId))
    results.push(await this.testCredentialRetrieval(userId))

    // Cache Tests
    results.push(await this.testCacheService())

    // API Tests
    results.push(await this.testZerodhaServiceInitialization())

    // Zerodha Credentials Test (if available)
    const hasCredentials = await CredentialService.hasCredentials(userId)
    if (hasCredentials) {
      results.push(await this.testZerodhaConnection(userId))
    } else {
      results.push({
        name: 'Zerodha Connection Test',
        status: 'skip',
        duration: 0,
        message: 'No credentials configured - skipped',
      })
    }

    const duration = Date.now() - startTime
    const passed = results.filter((r) => r.status === 'pass').length
    const failed = results.filter((r) => r.status === 'fail').length
    const skipped = results.filter((r) => r.status === 'skip').length

    return {
      timestamp: new Date(),
      totalTests: results.length,
      passed,
      failed,
      skipped,
      duration,
      results,
    }
  }

  /**
   * Test database connection
   */
  private static async testDatabaseConnection(): Promise<TestResult> {
    const startTime = Date.now()
    const name = 'Database Connection'

    try {
      const result = await query('SELECT 1')
      const duration = Date.now() - startTime

      if (result.rows.length > 0) {
        return { name, status: 'pass', duration, message: 'Connected successfully' }
      } else {
        return { name, status: 'fail', duration, error: 'No response from database' }
      }
    } catch (error: any) {
      return {
        name,
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message,
      }
    }
  }

  /**
   * Test database tables exist
   */
  private static async testDatabaseTables(): Promise<TestResult> {
    const startTime = Date.now()
    const name = 'Database Tables'

    try {
      const requiredTables = [
        'users',
        'trading_accounts',
        'logs',
        'errors',
        'audit_logs',
        'incidents',
        'notifications',
        'user_trading_credentials',
      ]

      const sql = `
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ANY($1)
      `

      const result = await query(sql, [requiredTables])
      const foundTables = result.rows.map((r) => r.table_name)
      const missingTables = requiredTables.filter((t) => !foundTables.includes(t))

      const duration = Date.now() - startTime

      if (missingTables.length === 0) {
        return {
          name,
          status: 'pass',
          duration,
          message: `All ${requiredTables.length} required tables exist`,
        }
      } else {
        return {
          name,
          status: 'fail',
          duration,
          error: `Missing tables: ${missingTables.join(', ')}`,
        }
      }
    } catch (error: any) {
      return {
        name,
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message,
      }
    }
  }

  /**
   * Test database indexes
   */
  private static async testDatabaseIndexes(): Promise<TestResult> {
    const startTime = Date.now()
    const name = 'Database Indexes'

    try {
      const sql = `
        SELECT COUNT(*) as index_count
        FROM pg_indexes
        WHERE schemaname = 'public'
      `

      const result = await query(sql, [])
      const indexCount = result.rows[0].index_count
      const duration = Date.now() - startTime

      if (indexCount > 20) {
        return {
          name,
          status: 'pass',
          duration,
          message: `${indexCount} indexes found - good for performance`,
        }
      } else {
        return {
          name,
          status: 'fail',
          duration,
          error: `Only ${indexCount} indexes - expected 20+`,
        }
      }
    } catch (error: any) {
      return {
        name,
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message,
      }
    }
  }

  /**
   * Test credential encryption
   */
  private static async testCredentialEncryption(): Promise<TestResult> {
    const startTime = Date.now()
    const name = 'Credential Encryption'

    try {
      const plaintext = 'test-api-key-12345'
      const encrypted = CredentialService.encrypt(plaintext)
      const decrypted = CredentialService.decrypt(encrypted)

      const duration = Date.now() - startTime

      if (decrypted === plaintext) {
        return {
          name,
          status: 'pass',
          duration,
          message: 'Encryption/decryption working correctly',
        }
      } else {
        return {
          name,
          status: 'fail',
          duration,
          error: 'Decrypted value does not match plaintext',
        }
      }
    } catch (error: any) {
      return {
        name,
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message,
      }
    }
  }

  /**
   * Test credential storage
   */
  private static async testCredentialStorage(userId: string): Promise<TestResult> {
    const startTime = Date.now()
    const name = 'Credential Storage'

    try {
      const dummyCredentials = {
        apiKey: 'test-api-key-1234567890',
        apiSecret: 'test-secret-0987654321',
      }

      await CredentialService.storeCredentials(userId, dummyCredentials)

      const duration = Date.now() - startTime

      return {
        name,
        status: 'pass',
        duration,
        message: 'Credentials stored successfully',
      }
    } catch (error: any) {
      return {
        name,
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message,
      }
    }
  }

  /**
   * Test credential retrieval
   */
  private static async testCredentialRetrieval(userId: string): Promise<TestResult> {
    const startTime = Date.now()
    const name = 'Credential Retrieval'

    try {
      const credentials = await CredentialService.getCredentials(userId)

      const duration = Date.now() - startTime

      if (
        credentials &&
        credentials.apiKey === 'test-api-key-1234567890' &&
        credentials.apiSecret === 'test-secret-0987654321'
      ) {
        return {
          name,
          status: 'pass',
          duration,
          message: 'Credentials retrieved and decrypted correctly',
        }
      } else {
        return {
          name,
          status: 'fail',
          duration,
          error: 'Retrieved credentials do not match stored values',
        }
      }
    } catch (error: any) {
      return {
        name,
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message,
      }
    }
  }

  /**
   * Test cache service
   */
  private static async testCacheService(): Promise<TestResult> {
    const startTime = Date.now()
    const name = 'Cache Service'

    try {
      const testKey = 'test-cache-key'
      const testValue = { data: 'test-value' }

      await CacheService.set(testKey, testValue, { ttl: 60 })
      const retrieved = await CacheService.get(testKey)

      const duration = Date.now() - startTime

      if (JSON.stringify(retrieved) === JSON.stringify(testValue)) {
        return {
          name,
          status: 'pass',
          duration,
          message: 'Cache service working correctly',
        }
      } else {
        return {
          name,
          status: 'fail',
          duration,
          error: 'Retrieved value does not match cached value',
        }
      }
    } catch (error: any) {
      return {
        name,
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message,
      }
    }
  }

  /**
   * Test Zerodha service initialization
   */
  private static async testZerodhaServiceInitialization(): Promise<TestResult> {
    const startTime = Date.now()
    const name = 'Zerodha Service Initialization'

    try {
      const service = new ZerodhaService(
        'test-key-12345',
        'test-secret-67890'
      )

      const duration = Date.now() - startTime

      if (service) {
        return {
          name,
          status: 'pass',
          duration,
          message: 'Zerodha service initialized successfully',
        }
      } else {
        return {
          name,
          status: 'fail',
          duration,
          error: 'Failed to initialize Zerodha service',
        }
      }
    } catch (error: any) {
      return {
        name,
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message,
      }
    }
  }

  /**
   * Test Zerodha connection
   */
  private static async testZerodhaConnection(userId: string): Promise<TestResult> {
    const startTime = Date.now()
    const name = 'Zerodha Connection'
    const TIMEOUT = 5000 // 5 second timeout

    try {
      const credentials = await CredentialService.getCredentials(userId)

      if (!credentials) {
        return {
          name,
          status: 'skip',
          duration: 0,
          message: 'No credentials available',
        }
      }

      const service = new ZerodhaService(
        credentials.apiKey,
        credentials.apiSecret,
        credentials.accessToken
      )

      // Add timeout to prevent hanging
      const profilePromise = service.getProfile()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), TIMEOUT)
      )

      const profile = await Promise.race([profilePromise, timeoutPromise])

      const duration = Date.now() - startTime

      if (profile && (profile as any).userId) {
        return {
          name,
          status: 'pass',
          duration,
          message: `Connected as ${(profile as any).userName}`,
        }
      } else {
        return {
          name,
          status: 'fail',
          duration,
          error: 'No profile data returned from Zerodha',
        }
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      return {
        name,
        status: 'fail',
        duration,
        error: error.message || 'Connection test failed',
      }
    }
  }

  /**
   * Get test report summary
   */
  static getReportSummary(result: TestSuiteResult): string {
    const passPercentage = ((result.passed / result.totalTests) * 100).toFixed(1)

    return `
Test Suite Results
==================
Total Tests: ${result.totalTests}
Passed: ${result.passed} ✅
Failed: ${result.failed} ❌
Skipped: ${result.skipped} ⏭️
Success Rate: ${passPercentage}%
Total Duration: ${result.duration}ms

${result.results.map((r) => `[${r.status.toUpperCase()}] ${r.name} (${r.duration}ms)`).join('\n')}
    `
  }
}
