import { query } from './database.ts'
import { logger } from './logger.ts'

export const dbTestUtils = {
  async cleanupDatabase() {
    try {
      // Delete in order of foreign key constraints
      await query('TRUNCATE TABLE orders CASCADE')
      await query('TRUNCATE TABLE trading_accounts CASCADE')
      await query('TRUNCATE TABLE users CASCADE')
      
      logger.info({ type: 'database_cleanup_complete' })
    } catch (error) {
      logger.error({
        type: 'database_cleanup_error',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },

  async resetSequences() {
    try {
      // Reset auto-increment sequences if any
      const tables = ['users', 'trading_accounts', 'orders', '_migrations']
      
      for (const table of tables) {
        try {
          const result = await query(
            `SELECT setval(pg_get_serial_sequence($1, 'id'), 1);`,
            [table]
          )
        } catch (e) {
          // Ignore if no sequence
        }
      }
    } catch (error) {
      logger.error({
        type: 'sequence_reset_error',
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
}
