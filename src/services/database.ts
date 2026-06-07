import { Pool } from 'pg'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { logger } from './logger.ts'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    pool.on('error', (err) => {
      logger.error({ type: 'pool_error', error: err.message })
    })
  }

  return pool
}

export async function connectDatabase() {
  try {
    const p = getPool()
    const result = await p.query('SELECT NOW()')
    logger.info({ type: 'database_connected', timestamp: result.rows[0].now })
  } catch (error) {
    logger.error({ type: 'database_connection_failed', error })
    throw error
  }
}

export async function disconnectDatabase() {
  if (pool) {
    await pool.end()
    pool = null
    logger.info({ type: 'database_disconnected' })
  }
}

export async function runMigrations() {
  try {
    const p = getPool()

    // Create migrations table if it doesn't exist
    await p.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Get list of migration files
    const migrationDir = join(process.cwd(), 'migrations')
    const files = readdirSync(migrationDir)
      .filter((f: string) => f.endsWith('.sql'))
      .sort()

    // Run each migration
    for (const file of files) {
      const result = await p.query(
        'SELECT * FROM _migrations WHERE name = $1',
        [file]
      )

      if (result.rows.length === 0) {
        const sql = readFileSync(join(migrationDir, file), 'utf-8')
        
        // Execute in transaction
        const client = await p.connect()
        try {
          await client.query('BEGIN')
          await client.query(sql)
          await client.query(
            'INSERT INTO _migrations (name) VALUES ($1)',
            [file]
          )
          await client.query('COMMIT')
          
          logger.info({ type: 'migration_executed', file })
        } catch (error) {
          await client.query('ROLLBACK')
          throw error
        } finally {
          client.release()
        }
      }
    }

    logger.info({ type: 'all_migrations_complete' })
  } catch (error) {
    logger.error({ type: 'migration_failed', error })
    throw error
  }
}

export async function query(text: string, params?: unknown[]) {
  const p = getPool()
  const start = Date.now()

  try {
    const result = await p.query(text, params)
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
}

// Execute migrations when run directly
if (import.meta.main) {
  runMigrations()
    .then(() => {
      logger.info({ type: 'migrations_complete' })
      process.exit(0)
    })
    .catch((error) => {
      logger.error({ type: 'migrations_failed', error })
      process.exit(1)
    })
}
