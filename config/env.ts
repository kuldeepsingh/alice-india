/**
 * Environment Variables (Typed & Validated)
 * All environment variables are loaded and typed here
 */

export interface AppEnvironment {
  // Node
  nodeEnv: 'development' | 'production' | 'test'

  // Server
  port: number
  host: string

  // Database
  databaseUrl: string
  databasePoolMax: number
  databasePoolIdleTimeout: number

  // Cache
  redisUrl: string
  cacheDefaultTtl: number

  // JWT
  jwtSecret: string
  jwtAccessTokenExpiry: string
  jwtRefreshTokenExpiry: string

  // API
  apiBaseUrl: string
  corsOrigins: string[]

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal'

  // Security
  bcryptRounds: number
  allowedOrigins: string[]

  // Feature Flags
  features: {
    enableTwoFactor: boolean
    enableWebhooks: boolean
    enableRealTimeNotifications: boolean
  }
}

/**
 * Load and validate environment variables
 */
export function loadEnvironment(): AppEnvironment {
  return {
    // Node
    nodeEnv: (process.env.NODE_ENV as any) || 'development',
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT || '3000', 10),

    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgres://localhost/bot_trade',
    databasePoolMax: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
    databasePoolIdleTimeout: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT || '30000', 10),

    // Cache
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    cacheDefaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10),

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtAccessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '24h',
    jwtRefreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',

    // API
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),

    // Logging
    logLevel: (process.env.LOG_LEVEL as any) || 'info',

    // Security
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    allowedOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),

    // Feature Flags
    features: {
      enableTwoFactor: process.env.ENABLE_TWO_FACTOR === 'true',
      enableWebhooks: process.env.ENABLE_WEBHOOKS === 'true',
      enableRealTimeNotifications: process.env.ENABLE_REAL_TIME_NOTIFICATIONS === 'true',
    },
  }
}

/**
 * Validate critical environment variables
 */
export function validateEnvironment(env: AppEnvironment): void {
  const errors: string[] = []

  // Validate required variables
  if (!env.databaseUrl) errors.push('DATABASE_URL is required')
  if (!env.jwtSecret) errors.push('JWT_SECRET is required')
  if (!env.redisUrl && env.nodeEnv !== 'test') errors.push('REDIS_URL is required')

  // Validate port range
  if (env.port < 1 || env.port > 65535) {
    errors.push(`PORT must be between 1 and 65535 (got ${env.port})`)
  }

  // Validate bcrypt rounds
  if (env.bcryptRounds < 4 || env.bcryptRounds > 31) {
    errors.push(`BCRYPT_ROUNDS must be between 4 and 31 (got ${env.bcryptRounds})`)
  }

  // Validate CORS origins
  if (!env.corsOrigins || env.corsOrigins.length === 0) {
    errors.push('CORS_ORIGINS must be configured')
  }

  // Throw if errors
  if (errors.length > 0) {
    console.error('❌ Environment Validation Failed:')
    errors.forEach(err => console.error(`  • ${err}`))
    process.exit(1)
  }

  console.log('✅ Environment variables validated')
}
