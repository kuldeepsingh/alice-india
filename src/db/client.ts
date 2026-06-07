import { Pool } from 'pg'
import { logger } from '../services/logger.ts'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  logger.error({ type: 'pool_error', error: err.message })
})

export const db = {
  query: async (text: string, params: unknown[] = []) => {
    const start = Date.now()
    try {
      const result = await pool.query(text, params)
      const duration = Date.now() - start
      
      if (duration > 1000) {
        logger.warn({
          type: 'slow_query',
          duration,
          query: text.substring(0, 100),
        })
      }
      
      return result
    } catch (error) {
      logger.error({
        type: 'database_error',
        error: error instanceof Error ? error.message : String(error),
        query: text.substring(0, 100),
      })
      throw error
    }
  },

  connect: async () => {
    try {
      const result = await pool.query('SELECT NOW()')
      logger.info({ type: 'database_connected', timestamp: result.rows[0].now })
    } catch (error) {
      logger.error({ type: 'database_connection_failed', error })
      throw error
    }
  },

  disconnect: async () => {
    await pool.end()
    logger.info({ type: 'database_disconnected' })
  },
}
