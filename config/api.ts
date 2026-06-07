/**
 * API Configuration
 * API settings, endpoints, and versioning
 */

import type { AppEnvironment } from './env'

export interface ApiConfig {
  baseUrl: string
  version: string
  corsOrigins: string[]
  rateLimiting: {
    enabled: boolean
    windowMs: number
    maxRequests: number
  }
  timeout: {
    request: number
    response: number
  }
  security: {
    trustProxy: boolean
    enableCors: boolean
    enableHelmets: boolean
  }
}

/**
 * Create API configuration from environment
 */
export function createApiConfig(env: AppEnvironment): ApiConfig {
  return {
    baseUrl: env.apiBaseUrl,
    version: 'v1',
    corsOrigins: env.corsOrigins,

    rateLimiting: {
      enabled: env.nodeEnv === 'production',
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // requests per window
    },

    timeout: {
      request: 30000, // 30 seconds
      response: 30000, // 30 seconds
    },

    security: {
      trustProxy: env.nodeEnv === 'production',
      enableCors: true,
      enableHelmets: env.nodeEnv === 'production',
    },
  }
}

/**
 * API Endpoints
 */
export const ApiEndpoints = {
  health: {
    live: '/health/live',
    ready: '/health/ready',
  },

  auth: {
    base: '/auth',
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },

  users: {
    base: '/users',
    byId: (id: string) => `/users/${id}`,
  },

  accounts: {
    base: '/accounts',
    byId: (id: string) => `/accounts/${id}`,
  },

  orders: {
    base: '/orders',
    byId: (id: string) => `/orders/${id}`,
  },

  market: {
    base: '/market',
    data: (symbol: string) => `/market/data/${symbol}`,
    quote: (symbol: string) => `/market/quote/${symbol}`,
  },
}

/**
 * HTTP Status Codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

/**
 * Error Response Format
 */
export interface ApiError {
  status: number
  code: string
  message: string
  timestamp: string
}

/**
 * Success Response Format
 */
export interface ApiSuccess<T> {
  status: 'success'
  data: T
  timestamp: string
}
