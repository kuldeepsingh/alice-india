import { createClient } from 'redis'
import { logger } from '../services/logger.ts'

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

redisClient.on('error', (err) => {
  logger.error({ type: 'redis_error', error: err.message })
})

export const cache = {
  client: redisClient as any,

  connect: async () => {
    try {
      await redisClient.connect()
      logger.info({ type: 'redis_connected' })
      cache.client = redisClient
    } catch (error) {
      logger.error({ type: 'redis_connection_failed', error })
      throw error
    }
  },

  disconnect: async () => {
    await redisClient.disconnect()
    logger.info({ type: 'redis_disconnected' })
  },

  get: (key: string) => redisClient.get(key),
  set: (key: string, value: string, ttl?: number) => {
    if (ttl) {
      return redisClient.setEx(key, ttl, value)
    }
    return redisClient.set(key, value)
  },
  del: (key: string) => redisClient.del(key),
}
