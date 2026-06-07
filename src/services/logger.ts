import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      env: process.env.NODE_ENV,
      version: '0.1.0',
    },
  },
  isDev ? pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  }) : undefined
)

export function childLogger(context: Record<string, unknown>) {
  return logger.child(context)
}
