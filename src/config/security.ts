/**
 * Security Configuration
 * RBAC roles and permissions
 */

export const Roles = {
  ADMIN: 'admin',
  SENIOR_DEV: 'senior_dev',
  DEVELOPER: 'developer',
  VIEWER: 'viewer',
  TRADER: 'trader',
  SUPPORT: 'support',
} as const

export const Permissions: Record<string, string[]> = {
  admin: [
    'view_logs',
    'view_errors',
    'view_audit',
    'manage_debug',
    'assign_errors',
    'export_audit',
  ],
  senior_dev: [
    'view_logs',
    'view_errors',
    'view_audit',
  ],
  developer: [
    'view_logs',
    'view_errors',
  ],
  viewer: [
    'view_logs',
  ],
  trader: [
    'view_orders',
    'create_orders',
  ],
  support: [
    'view_logs',
    'view_audit',
  ],
}

export const SecurityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    accessTokenExpiry: '24h',
    refreshTokenExpiry: '7d',
  },
  cors: {
    credentials: true,
    maxAge: 86400,
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
  },
}
