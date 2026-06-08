/**
 * User Configuration Routes
 * 
 * Handles:
 * - API key storage per user
 * - Credential management
 * - Settings management
 */

import { Router, Request, Response } from 'express'
import { logger } from '../services/logger.ts'

const router = Router()

// Store user API keys (in-memory for demo, should be encrypted in DB for production)
const userApiKeys: Record<string, any> = {}

/**
 * POST /config/api-keys
 * Store user's API keys (Claude, Zerodha, etc)
 */
router.post('/api-keys', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    const { claudeApiKey, zerodhaApiKey, zerodhaApiSecret } = req.body

    if (!claudeApiKey && !zerodhaApiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one API key is required',
      })
    }

    // Store keys (in production: encrypt and store in database)
    userApiKeys[userId] = {
      claudeApiKey: claudeApiKey || userApiKeys[userId]?.claudeApiKey,
      zerodhaApiKey: zerodhaApiKey || userApiKeys[userId]?.zerodhaApiKey,
      zerodhaApiSecret: zerodhaApiSecret || userApiKeys[userId]?.zerodhaApiSecret,
      updatedAt: new Date(),
    }

    logger.info({
      type: 'api_keys_stored',
      userId,
      hasClaudeKey: !!claudeApiKey,
      hasZerodhaKey: !!zerodhaApiKey,
    })

    res.status(200).json({
      status: 'success',
      message: 'API keys stored successfully',
      data: {
        hasClaudeKey: !!userApiKeys[userId].claudeApiKey,
        hasZerodhaKey: !!userApiKeys[userId].zerodhaApiKey,
      },
    })
  } catch (error) {
    logger.error({
      type: 'api_keys_error',
      error: error instanceof Error ? error.message : String(error),
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to store API keys',
    })
  }
})

/**
 * GET /config/api-keys
 * Retrieve stored API keys (return only metadata, not actual keys)
 */
router.get('/api-keys', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    const keys = userApiKeys[userId]

    res.status(200).json({
      status: 'success',
      data: {
        hasClaudeKey: !!(keys?.claudeApiKey),
        hasZerodhaKey: !!(keys?.zerodhaApiKey),
        updatedAt: keys?.updatedAt || null,
      },
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve API keys status',
    })
  }
})

/**
 * Middleware to inject user's API keys into request
 * Usage: req.userApiKeys.claudeApiKey
 */
export const attachUserApiKeys = (req: Request, res: Response, next: Function) => {
  const userId = req.headers['x-user-id'] as string || 'anonymous'
  req.userApiKeys = userApiKeys[userId] || {}
  next()
}

export default router
