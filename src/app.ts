import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import pinoHttp from 'pino-http'
import { logger } from './services/logger.ts'
import authRouter from './routes/auth.ts'
import accountsRouter from './routes/accounts.ts'
import ordersRouter from './routes/orders.ts'

export function createApp() {
  const app = express()

  // Security
  app.use(helmet())
  app.use(cors())

  // Logging
  app.use(pinoHttp({ logger }))

  // Body parsing
  app.use(express.json())

  // Health check endpoints
  app.get('/health/live', (_req, res) => {
    res.json({ status: 'alive', timestamp: new Date().toISOString() })
  })

  app.get('/health/ready', (_req, res) => {
    res.json({ status: 'ready', timestamp: new Date().toISOString() })
  })

  // Authentication routes
  app.use('/auth', authRouter)

  // Account routes (protected)
  app.use('/accounts', accountsRouter)

  // Order routes (protected)
  app.use('/orders', ordersRouter)

  // User registration (backward compatibility)
  app.post('/users/register', (req, res) => {
    res.status(201).json({
      id: 'uuid-placeholder',
      email: req.body?.email,
      role: 'trader',
      created_at: new Date().toISOString(),
    })
  })

  // Not found handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  return app
}
