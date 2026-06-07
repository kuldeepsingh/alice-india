/**
 * Log Model
 * Represents a structured log entry in the application
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

export interface Log {
  id: string
  timestamp: Date
  level: LogLevel
  message: string
  userId?: string
  correlationId?: string
  module?: string
  context?: Record<string, any>
  stackTrace?: string
  requestId?: string
  sessionId?: string
  ipAddress?: string
  createdAt: Date
}

export interface CreateLogInput {
  level: LogLevel
  message: string
  userId?: string
  correlationId?: string
  module?: string
  context?: Record<string, any>
  stackTrace?: string
  requestId?: string
  sessionId?: string
  ipAddress?: string
}

export interface LogFilter {
  userId?: string
  level?: LogLevel
  module?: string
  correlationId?: string
  startDate?: Date
  endDate?: Date
  search?: string
  limit?: number
  offset?: number
}

export interface LogQueryResult {
  data: Log[]
  total: number
  page: number
  pageSize: number
}

// Log level hierarchy
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
}

/**
 * Check if a log should be captured based on configured level
 */
export function shouldLogLevel(
  configuredLevel: LogLevel,
  logLevel: LogLevel
): boolean {
  return LOG_LEVEL_PRIORITY[logLevel] >= LOG_LEVEL_PRIORITY[configuredLevel]
}
