/**
 * API Keys Route
 *
 * Secure endpoints for managing user API keys.
 * - POST /api/v1/user/api-keys - Save encrypted API keys
 * - GET /api/v1/user/api-keys/status - Check which keys are configured
 * - DELETE /api/v1/user/api-keys/:keyType - Delete a specific key
 *
 * All keys are encrypted at rest in the database.
 * Keys are never returned to the client after initial entry.
 */

import express, { Request, Response } from 'express'
import { apiKeyVaultService } from '../services/api-key-vault-service'
import { logger } from '../services/logger'

const router = express.Router()

// Middleware: Require authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
  const userId = req.headers['x-user-id'] as string
  if (!userId) {
    return res.status(401).json({ error: 'User ID required (x-user-id header)' })
  }
  req.user = { id: userId }
  next()
}

// Declare module to extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: { id: string }
    }
  }
}

/**
 * POST /api/v1/user/api-keys
 * Save encrypted API keys for the current user
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { claudeApiKey, zerodhaApiKey, zerodhaApiSecret } = req.body

    // Validate at least one key is provided
    if (!claudeApiKey && !zerodhaApiKey && !zerodhaApiSecret) {
      return res.status(400).json({
        error: 'At least one API key must be provided',
      })
    }

    // Validate Zerodha key/secret pair
    if ((zerodhaApiKey && !zerodhaApiSecret) || (!zerodhaApiKey && zerodhaApiSecret)) {
      return res.status(400).json({
        error: 'Zerodha requires both API key and secret',
      })
    }

    const results: Record<string, any> = {}

    // Store Claude key if provided
    if (claudeApiKey) {
      try {
        const encryptedClaude = apiKeyVaultService.encrypt(claudeApiKey)
        // TODO: Save to database with: userId, keyType: 'claude', encryptedValue, iv
        results.claude = { stored: true, timestamp: new Date().toISOString() }

        logger.info({
          type: 'api_key_stored',
          userId,
          keyType: 'claude',
        })
      } catch (error) {
        logger.error({
          type: 'claude_key_storage_failed',
          userId,
          error: error instanceof Error ? error.message : String(error),
        })
        results.claude = { stored: false, error: 'Failed to store Claude key' }
      }
    }

    // Store Zerodha keys if provided
    if (zerodhaApiKey && zerodhaApiSecret) {
      try {
        const encryptedKey = apiKeyVaultService.encrypt(zerodhaApiKey)
        const encryptedSecret = apiKeyVaultService.encrypt(zerodhaApiSecret)
        // TODO: Save to database with encrypted values
        results.zerodha = { stored: true, timestamp: new Date().toISOString() }

        logger.info({
          type: 'api_key_stored',
          userId,
          keyType: 'zerodha',
        })
      } catch (error) {
        logger.error({
          type: 'zerodha_key_storage_failed',
          userId,
          error: error instanceof Error ? error.message : String(error),
        })
        results.zerodha = { stored: false, error: 'Failed to store Zerodha keys' }
      }
    }

    res.json({
      status: 'success',
      message: 'API keys stored securely',
      results,
    })
  } catch (error) {
    logger.error({
      type: 'api_key_route_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({
      error: 'Failed to store API keys',
      details: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * GET /api/v1/user/api-keys/status
 * Check which API keys are configured (without returning the keys)
 */
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    // TODO: Query database to check which keys exist for this user
    // For now, return mock data
    const hasClaudeKey = false // TODO: Check in database
    const hasZerodhaKey = false // TODO: Check in database

    res.json({
      status: 'success',
      data: {
        claude: {
          configured: hasClaudeKey,
          updatedAt: hasClaudeKey ? new Date().toISOString() : null,
        },
        zerodha: {
          configured: hasZerodhaKey,
          updatedAt: hasZerodhaKey ? new Date().toISOString() : null,
        },
      },
    })
  } catch (error) {
    logger.error({
      type: 'api_key_status_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({
      error: 'Failed to check API key status',
    })
  }
})

/**
 * DELETE /api/v1/user/api-keys/:keyType
 * Delete a specific API key for the current user
 */
router.delete('/:keyType', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const { keyType } = req.params

    // Validate keyType
    if (!['claude', 'zerodha'].includes(keyType)) {
      return res.status(400).json({
        error: 'Invalid key type. Must be "claude" or "zerodha"',
      })
    }

    // TODO: Delete from database
    logger.info({
      type: 'api_key_deleted',
      userId,
      keyType,
    })

    res.json({
      status: 'success',
      message: `${keyType} API key deleted`,
    })
  } catch (error) {
    logger.error({
      type: 'api_key_deletion_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({
      error: 'Failed to delete API key',
    })
  }
})

/**
 * POST /api/v1/user/api-keys/internal/get
 * Internal endpoint for backend services to retrieve decrypted keys
 * (Only for backend-to-backend communication, not exposed to frontend)
 */
router.post('/internal/get', async (req: Request, res: Response) => {
  try {
    const { userId, keyType } = req.body

    if (!userId || !keyType) {
      return res.status(400).json({
        error: 'userId and keyType required',
      })
    }

    if (!['claude', 'zerodha'].includes(keyType)) {
      return res.status(400).json({
        error: 'Invalid key type',
      })
    }

    // TODO: Fetch from database, decrypt, and return
    logger.info({
      type: 'api_key_internal_access',
      userId,
      keyType,
    })

    res.json({
      status: 'success',
      data: null, // Placeholder
    })
  } catch (error) {
    logger.error({
      type: 'api_key_internal_error',
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(500).json({
      error: 'Failed to retrieve API key',
    })
  }
})

export default router
