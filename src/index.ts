import 'dotenv/config'
import { createApp } from './app.ts'
import { connectDatabase, disconnectDatabase, runMigrations } from './services/database.ts'
import { cache } from './cache/client.ts'
import { logger } from './services/logger.ts'

const PORT = process.env.PORT || 3000

async function main() {
  try {
    // Connect to database
    await connectDatabase()

    // Run migrations (commented out for now - using manual schema)
    // await runMigrations()

    // Connect to cache
    await cache.connect()

    // Create and start app
    const app = createApp()

    app.listen(PORT, () => {
      logger.info({
        type: 'server_started',
        port: PORT,
        environment: process.env.NODE_ENV,
      })
    })

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info({ type: 'shutting_down' })
      await disconnectDatabase()
      await cache.disconnect()
      process.exit(0)
    })
  } catch (error) {
    logger.error({
      type: 'startup_failed',
      error: error instanceof Error ? error.message : String(error),
    })
    process.exit(1)
  }
}

main()
