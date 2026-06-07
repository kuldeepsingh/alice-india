/**
 * Error Model
 * Represents a grouped error entry for tracking and resolution
 */

export type ErrorStatus = 'new' | 'investigating' | 'resolved'

export interface Error {
  id: string
  errorHash: string
  title: string
  message: string
  stackTrace: string
  firstOccurrence: Date
  lastOccurrence: Date
  occurrenceCount: number
  affectedUsers: number
  status: ErrorStatus
  assignedTo?: string
  context?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ErrorWithUser extends Error {
  assignedToUser?: {
    id: string
    email: string
    role: string
  }
}

export interface CreateErrorInput {
  title: string
  message: string
  stackTrace: string
  context?: Record<string, any>
}

export interface UpdateErrorInput {
  status?: ErrorStatus
  assignedTo?: string
}

export interface ErrorFilter {
  status?: ErrorStatus
  assignedTo?: string
  sortBy?: 'occurrence' | 'timestamp' | 'affectedUsers'
  limit?: number
  offset?: number
}

export interface ErrorQueryResult {
  data: ErrorWithUser[]
  total: number
  errorRate: number
  topErrors: ErrorWithUser[]
}

export interface ErrorInstance {
  logId: string
  timestamp: Date
  userId?: string
  ipAddress?: string
  message: string
}

/**
 * Create error signature from error message and stack trace
 * Used for grouping similar errors together
 */
export function createErrorSignature(message: string, stackTrace: string): string {
  const crypto = require('crypto')

  // Take first 3 lines of stack trace for signature
  const stackLines = stackTrace
    .split('\n')
    .slice(0, 3)
    .join('\n')

  const combined = `${message}\n${stackLines}`

  return crypto
    .createHash('sha256')
    .update(combined)
    .digest('hex')
}

/**
 * Error severity levels for internal use
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Determine error severity based on affected users and occurrence count
 */
export function determineErrorSeverity(
  affectedUsers: number,
  occurrenceCount: number
): ErrorSeverity {
  if (affectedUsers > 100 || occurrenceCount > 1000) {
    return ErrorSeverity.CRITICAL
  }
  if (affectedUsers > 50 || occurrenceCount > 500) {
    return ErrorSeverity.HIGH
  }
  if (affectedUsers > 10 || occurrenceCount > 100) {
    return ErrorSeverity.MEDIUM
  }
  return ErrorSeverity.LOW
}
