// Frontend logging service for browser console and backend logs

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

interface LogEntry {
  level: LogLevel
  service: string
  message: string
  data?: any
  timestamp: string
}

class FrontendLogger {
  private getColor(level: LogLevel): string {
    const colors = {
      DEBUG: '#00a8ff', // Cyan
      INFO: '#10b981', // Green
      WARN: '#f59e0b', // Amber
      ERROR: '#ef4444', // Red
    }
    return colors[level]
  }

  private async sendToBackend(entry: LogEntry): Promise<void> {
    try {
      // Send to backend logging API
      await fetch('/api/v1/admin/logs/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Fail silently - don't disrupt app if logging fails
      })
    } catch (e) {
      // Ignore errors
    }
  }

  private log(level: LogLevel, service: string, message: string, data?: any): void {
    const entry: LogEntry = {
      level,
      service,
      message,
      data,
      timestamp: new Date().toISOString(),
    }

    // Console log with color
    const color = this.getColor(level)
    const style = `color: ${color}; font-weight: bold;`
    console.log(`%c[${level}] ${service}: ${message}`, style, data || '')

    // Send to backend (async, don't wait)
    this.sendToBackend(entry)
  }

  debug(service: string, message: string, data?: any): void {
    this.log('DEBUG', service, message, data)
  }

  info(service: string, message: string, data?: any): void {
    this.log('INFO', service, message, data)
  }

  warn(service: string, message: string, data?: any): void {
    this.log('WARN', service, message, data)
  }

  error(service: string, message: string, error?: Error, data?: any): void {
    const fullData = {
      ...data,
      error: error?.message,
      stack: error?.stack,
    }
    this.log('ERROR', service, message, fullData)
  }
}

export const frontendLogger = new FrontendLogger()
