import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import pinoHttp from 'pino-http'
import { logger } from './services/logger.ts'

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

  // User registration (placeholder)
  app.post('/users/register', (_req, res) => {
    res.status(201).json({
      id: 'uuid-placeholder',
      email: _req.body?.email,
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
