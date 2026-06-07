/**
 * Database Configuration
 * Centralized database settings and connection pooling configuration
 */

import type { AppEnvironment } from './env'

export interface DatabaseConfig {
  url: string
  poolConfig: {
    max: number
    idleTimeoutMillis: number
    connectionTimeoutMillis: number
  }
  queryLogging: {
    enabled: boolean
    slowQueryThreshold: number // milliseconds
  }
  ssl: {
    rejectUnauthorized: boolean
  }
}

/**
 * Create database configuration from environment
 */
export function createDatabaseConfig(env: AppEnvironment): DatabaseConfig {
  const isProduction = env.nodeEnv === 'production'

  return {
    url: env.databaseUrl,

    poolConfig: {
      max: env.databasePoolMax,
      idleTimeoutMillis: env.databasePoolIdleTimeout,
      connectionTimeoutMillis: 2000,
    },

    queryLogging: {
      enabled: true,
      slowQueryThreshold: 1000, // Log queries taking >1 second
    },

    ssl: {
      // Require SSL in production
      rejectUnauthorized: isProduction,
    },
  }
}

/**
 * Database connection info
 */
export const DatabaseInfo = {
  migrations: {
    directory: './migrations',
    table: '_migrations',
  },
  pools: {
    default: 'default',
    replica: 'replica', // For future read replicas
  },
  indexes: {
    users: ['email', 'created_at'],
    orders: ['user_id', 'account_id', 'status', 'created_at'],
    accounts: ['user_id', 'status'],
  },
}
