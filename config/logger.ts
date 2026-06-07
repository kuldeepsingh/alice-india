/**
 * Logger Configuration
 * Structured logging with Pino
 */

import type { AppEnvironment } from './env'

export interface LoggerConfig {
  level: string
  transport: {
    target: string
    options?: any
  } | null
  formatters: {
    level: (label: string) => { level: number }
    bindings: () => {}
  }
  serializers: any
  timestamp: () => string
}

/**
 * Create logger configuration from environment
 */
export function createLoggerConfig(env: AppEnvironment): LoggerConfig {
  const isProduction = env.nodeEnv === 'production'
  const isDevelopment = env.nodeEnv === 'development'

  return {
    level: env.logLevel,

    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
      : null,

    formatters: {
      level: (label) => ({
        level: label.toUpperCase(),
      }),
      bindings: () => ({}),
    },

    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: {
          host: req.headers.host,
          'user-agent': req.headers['user-agent'],
        },
        query: req.query,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },

    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
  }
}

/**
 * Log levels and their purposes
 */
export const LogLevels = {
  DEBUG: 'debug', // Detailed diagnostic information
  INFO: 'info', // Informational messages
  WARN: 'warn', // Warning messages
  ERROR: 'error', // Error messages
  FATAL: 'fatal', // Fatal error messages
}

/**
 * Log event types
 */
export const LogEvents = {
  // Authentication
  AUTH_REGISTER: 'auth:register',
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_FAILED: 'auth:failed',

  // Database
  DB_CONNECT: 'db:connect',
  DB_ERROR: 'db:error',
  DB_QUERY_SLOW: 'db:query_slow',

  // Cache
  CACHE_HIT: 'cache:hit',
  CACHE_MISS: 'cache:miss',
  CACHE_ERROR: 'cache:error',

  // API
  API_REQUEST: 'api:request',
  API_RESPONSE: 'api:response',
  API_ERROR: 'api:error',

  // System
  SERVER_START: 'server:start',
  SERVER_READY: 'server:ready',
  SERVER_ERROR: 'server:error',
}
