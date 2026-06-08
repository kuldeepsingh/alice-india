/**
 * Frontend Logging Service
 * 
 * This module provides comprehensive logging for the frontend (React) application.
 * Logs are sent to:
 * 1. Browser console (with colors for visual debugging)
 * 2. Backend logging API (for persistence and admin viewing)
 * 
 * Purpose:
 * - Track user actions (login, order placement, form submissions)
 * - Log API requests and responses
 * - Capture errors with full context
 * - Enable debugging without relying on browser DevTools
 * - Provide audit trail accessible from admin dashboard
 * 
 * Log Levels (in order of severity):
 * - DEBUG: Detailed flow information (requests, state changes)
 * - INFO: Important business events (login success, order creation)
 * - WARN: Unusual but recoverable situations (retries, timeouts)
 * - ERROR: Errors that need attention (validation failures, API errors)
 * 
 * Usage Examples:
 *   frontendLogger.debug('API', 'GET /users started')
 *   frontendLogger.info('Orders', 'Order placed', { orderId, symbol })
 *   frontendLogger.error('API', 'Request failed', error, { status, response })
 */

// Types: Log levels for type-safe logging
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

/**
 * LogEntry interface defines the structure of each log entry.
 * These entries are sent to the backend for storage and admin viewing.
 */
interface LogEntry {
  level: LogLevel                  // Log severity level
  service: string                 // Which service/component (e.g., "API", "Orders")
  message: string                 // Human-readable log message
  data?: any                      // Additional context data (optional)
  timestamp: string               // ISO timestamp when log was created
}

/**
 * FrontendLogger class
 * 
 * Main logging implementation for frontend.
 * Provides colored console output and backend persistence.
 */
class FrontendLogger {
  /**
   * getColor: Returns console.log color code for log level
   * 
   * Colors help distinguish different log levels visually:
   * - DEBUG (cyan): #00a8ff - detailed flow info
   * - INFO (green): #10b981 - important events
   * - WARN (amber): #f59e0b - unusual but recoverable
   * - ERROR (red): #ef4444 - errors needing attention
   * 
   * @param level - The log level to get color for
   * @returns CSS color string for console styling
   */
  private getColor(level: LogLevel): string {
    const colors = {
      DEBUG: '#00a8ff', // Cyan
      INFO: '#10b981', // Green
      WARN: '#f59e0b', // Amber
      ERROR: '#ef4444', // Red
    }
    return colors[level]
  }

  /**
   * sendToBackend: Sends log entry to backend API for persistence
   * 
   * This is async and doesn't block logging - if backend is unreachable,
   * logging continues normally. Backend logs are viewable from admin dashboard.
   * 
   * Endpoint: POST /api/v1/admin/logs/client
   * 
   * @param entry - The log entry to send to backend
   */
  private async sendToBackend(entry: LogEntry): Promise<void> {
    try {
      // POST to backend logging endpoint
      await fetch('/api/v1/admin/logs/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Fail silently - don't disrupt app if logging fails
        // This is intentional - logging should never break the app
      })
    } catch (e) {
      // Ignore any errors from backend communication
      // The app must continue working even if logging fails
    }
  }

  /**
   * log: Internal method that performs the actual logging
   * 
   * This method:
   * 1. Creates a log entry with timestamp and metadata
   * 2. Logs to browser console with color-coding
   * 3. Sends to backend asynchronously (non-blocking)
   * 
   * @param level - Log severity level (DEBUG, INFO, WARN, ERROR)
   * @param service - Which service/component is logging
   * @param message - Human-readable message
   * @param data - Optional additional context
   */
  private log(level: LogLevel, service: string, message: string, data?: any): void {
    // Create log entry with metadata
    const entry: LogEntry = {
      level,
      service,
      message,
      data,
      timestamp: new Date().toISOString(),
    }

    // Log to browser console with color-coding
    // Format: [LEVEL] Service: Message
    const color = this.getColor(level)
    const style = `color: ${color}; font-weight: bold;`
    console.log(`%c[${level}] ${service}: ${message}`, style, data || '')

    // Send to backend asynchronously (don't wait for response)
    // This allows logging to complete without blocking the app
    this.sendToBackend(entry)
  }

  /**
   * debug: Log detailed flow information
   * 
   * Use for:
   * - API requests starting/ending
   * - State changes
   * - Validation steps
   * - Component lifecycle
   * - User action steps
   * 
   * Example:
   *   frontendLogger.debug('API', 'GET /users started')
   *   frontendLogger.debug('Orders', 'Order validation passed', { symbol, qty })
   * 
   * @param service - Which component/service is logging
   * @param message - What happened
   * @param data - Optional context data
   */
  debug(service: string, message: string, data?: any): void {
    this.log('DEBUG', service, message, data)
  }

  /**
   * info: Log important business events
   * 
   * Use for:
   * - User login success
   * - Order creation
   * - Order execution
   * - Deposit received
   * - Withdrawal processed
   * - Settings changed
   * 
   * Example:
   *   frontendLogger.info('Orders', 'Order executed', { orderId, symbol, qty })
   *   frontendLogger.info('Auth', 'User logged in', { userId, email })
   * 
   * @param service - Which component/service is logging
   * @param message - What happened
   * @param data - Context data (user, order, amount, etc.)
   */
  info(service: string, message: string, data?: any): void {
    this.log('INFO', service, message, data)
  }

  /**
   * warn: Log unusual but recoverable situations
   * 
   * Use for:
   * - Retry attempts
   * - Timeouts with fallback
   * - Performance degradation
   * - Rate limits approaching
   * - Deprecated feature usage
   * 
   * Example:
   *   frontendLogger.warn('API', 'Slow response', { duration: 5000, threshold: 3000 })
   * 
   * @param service - Which component/service is logging
   * @param message - What warning occurred
   * @param data - Additional context
   */
  warn(service: string, message: string, data?: any): void {
    this.log('WARN', service, message, data)
  }

  /**
   * error: Log errors that need attention
   * 
   * Use for:
   * - Validation failures
   * - API request failures
   * - Network errors
   * - Permission denied
   * - Invalid data
   * 
   * IMPORTANT: Include the Error object and context data
   * 
   * Example:
   *   frontendLogger.error('Orders', 'Order placement failed', error, {
   *     symbol, qty, reason: 'insufficient_balance'
   *   })
   * 
   * @param service - Which component/service is logging
   * @param message - What error occurred
   * @param error - Error object (for stack trace)
   * @param data - Additional context (status, reason, etc.)
   */
  error(service: string, message: string, error?: Error, data?: any): void {
    // Combine error details with additional context data
    const fullData = {
      ...data,
      error: error?.message,
      stack: error?.stack,
    }
    this.log('ERROR', service, message, fullData)
  }
}

/**
 * frontendLogger: Singleton instance for use throughout the app
 * 
 * Export a single instance so all parts of the app log to the same place.
 * This ensures consistent logging and centralized control.
 * 
 * Usage:
 *   import { frontendLogger } from '../services/logging-client'
 *   frontendLogger.info('Orders', 'Order created', { orderId })
 */
export const frontendLogger = new FrontendLogger()
