/**
 * Security Configuration
 * JWT, password hashing, rate limiting, and security headers
 */

import type { AppEnvironment } from './env'

export interface SecurityConfig {
  jwt: {
    secret: string
    accessTokenExpiry: string
    refreshTokenExpiry: string
    issuer: string
    audience: string
  }
  password: {
    bcryptRounds: number
    minLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
  }
  cors: {
    origins: string[]
    credentials: boolean
    methods: string[]
    allowedHeaders: string[]
    maxAge: number
  }
  headers: {
    'Content-Security-Policy': string
    'X-Content-Type-Options': string
    'X-Frame-Options': string
    'X-XSS-Protection': string
    'Strict-Transport-Security': string
    'Access-Control-Max-Age': string
  }
  rateLimiting: {
    enabled: boolean
    windowMs: number
    maxRequests: number
  }
  session: {
    name: string
    secret: string
    maxAge: number // milliseconds
  }
}

/**
 * Create security configuration from environment
 */
export function createSecurityConfig(env: AppEnvironment): SecurityConfig {
  const isProduction = env.nodeEnv === 'production'

  return {
    jwt: {
      secret: env.jwtSecret,
      accessTokenExpiry: env.jwtAccessTokenExpiry,
      refreshTokenExpiry: env.jwtRefreshTokenExpiry,
      issuer: 'bot-trade-api',
      audience: 'bot-trade-frontend',
    },

    password: {
      bcryptRounds: env.bcryptRounds,
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false, // Optional, not enforced
    },

    cors: {
      origins: env.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400, // 24 hours
    },

    headers: {
      'Content-Security-Policy': isProduction
        ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
        : "*",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': isProduction
        ? 'max-age=31536000; includeSubDomains'
        : 'max-age=0',
      'Access-Control-Max-Age': '86400',
    },

    rateLimiting: {
      enabled: isProduction,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // requests per window
    },

    session: {
      name: 'sessionId',
      secret: env.jwtSecret,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }
}

/**
 * Password validation helper
 */
export function validatePassword(password: string, config: SecurityConfig['password']): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < config.minLength) {
    errors.push(`Password must be at least ${config.minLength} characters long`)
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (config.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (config.requireSpecialChars && !/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Security roles and permissions
 */
export const Roles = {
  ADMIN: 'admin',
  TRADER: 'trader',
  VIEWER: 'viewer',
}

/**
 * Role-based permissions
 */
export const Permissions = {
  [Roles.ADMIN]: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'accounts:read',
    'accounts:create',
    'accounts:update',
    'accounts:delete',
    'orders:read',
    'orders:create',
    'orders:update',
    'orders:delete',
    'market:read',
  ],
  [Roles.TRADER]: [
    'users:read',
    'accounts:read',
    'accounts:create',
    'orders:read',
    'orders:create',
    'orders:update',
    'market:read',
  ],
  [Roles.VIEWER]: [
    'users:read',
    'accounts:read',
    'orders:read',
    'market:read',
  ],
}
