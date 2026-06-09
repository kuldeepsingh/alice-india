// @ts-nocheck
/**
 * API Keys Route
 *
 * Secure endpoints for managing user API keys with encryption.
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
import { authMiddleware, AuthRequest } from '../middleware/auth'
import pg from 'pg'

const router = express.Router()
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

// Middleware: Extract user ID from JWT or header
const getUserId = (req: Request): string | null => {
  return (req.user as any)?.userId || (req.user as any)?.id || (req.headers['x-user-id'] as string) || null
}

/**
 * POST /api/v1/user/api-keys
 * Save encrypted API keys for the current user
 * Auth: Required
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' })
    }

    const { claudeApiKey, zerodhaApiKey, zerodhaApiSecret } = req.body
    const ipAddress = req.ip || req.connection.remoteAddress

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
        const { encrypted, iv } = apiKeyVaultService.encryptForStorage(claudeApiKey)
        
        // Insert into database
        await pool.query(
          `INSERT INTO user_api_keys (user_id, key_type, encrypted_value, iv)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, key_type) WHERE deleted_at IS NULL
           DO UPDATE SET encrypted_value = $3, iv = $4, updated_at = CURRENT_TIMESTAMP`,
          [userId, 'claude', encrypted, iv],
        )

        // Log audit
        await pool.query(
          `INSERT INTO api_key_audit_log (user_id, action, key_type, ip_address, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, 'stored', 'claude', ipAddress, 'success'],
        )

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
        const { encrypted: keyEncrypted, iv: keyIv } = apiKeyVaultService.encryptForStorage(zerodhaApiKey)
        const { encrypted: secretEncrypted, iv: secretIv } = apiKeyVaultService.encryptForStorage(zerodhaApiSecret)

        // Store as combined Zerodha entry (for simplicity)
        const combined = JSON.stringify({ key: keyEncrypted, keyIv, secret: secretEncrypted, secretIv })
        
        await pool.query(
          `INSERT INTO user_api_keys (user_id, key_type, encrypted_value, iv)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, key_type) WHERE deleted_at IS NULL
           DO UPDATE SET encrypted_value = $3, iv = $4, updated_at = CURRENT_TIMESTAMP`,
          [userId, 'zerodha', combined, 'combined'],
        )

        // Log audit
        await pool.query(
          `INSERT INTO api_key_audit_log (user_id, action, key_type, ip_address, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, 'stored', 'zerodha', ipAddress, 'success'],
        )

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
    })
  }
})

/**
 * GET /api/v1/user/api-keys/status
 * Check which API keys are configured (without returning the keys)
 * Auth: Required
 */
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' })
    }

    const result = await pool.query(
      `SELECT key_type, updated_at FROM user_api_keys
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    )

    const hasClaudeKey = result.rows.some((row) => row.key_type === 'claude')
    const hasZerodhaKey = result.rows.some((row) => row.key_type === 'zerodha')

    const claudeRow = result.rows.find((row) => row.key_type === 'claude')
    const zerodhaRow = result.rows.find((row) => row.key_type === 'zerodha')

    res.json({
      status: 'success',
      data: {
        claude: {
          configured: hasClaudeKey,
          updatedAt: claudeRow?.updated_at || null,
        },
        zerodha: {
          configured: hasZerodhaKey,
          updatedAt: zerodhaRow?.updated_at || null,
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
router.delete('/:keyType', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req)
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' })
    }

    const { keyType } = req.params
    const ipAddress = req.ip || req.connection.remoteAddress

    // Validate keyType
    if (!['claude', 'zerodha'].includes(keyType)) {
      return res.status(400).json({
        error: 'Invalid key type. Must be "claude" or "zerodha"',
      })
    }

    // Soft delete
    const result = await pool.query(
      `UPDATE user_api_keys SET deleted_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND key_type = $2 AND deleted_at IS NULL
       RETURNING id`,
      [userId, keyType],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: `${keyType} API key not found`,
      })
    }

    // Log audit
    await pool.query(
      `INSERT INTO api_key_audit_log (user_id, action, key_type, ip_address, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'deleted', keyType, ipAddress, 'success'],
    )

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
 * NOTE: This route bypasses auth middleware - called internally by backend services
 */
router.post('/internal/get', async (req: Request, res: Response) => {
  let userId: string | undefined
  let keyType: string | undefined

  try {
    userId = req.body.userId
    keyType = req.body.keyType

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

    const result = await pool.query(
      `SELECT encrypted_value, iv FROM user_api_keys
       WHERE user_id = $1 AND key_type = $2 AND deleted_at IS NULL`,
      [userId, keyType],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: `${keyType} key not found`,
      })
    }

    const { encrypted_value, iv } = result.rows[0]

    // Decrypt the key
    let decrypted
    if (keyType === 'zerodha') {
      // Handle combined Zerodha key
      const combined = JSON.parse(encrypted_value)
      const key = apiKeyVaultService.decryptFromStorage(combined.key, combined.keyIv)
      const secret = apiKeyVaultService.decryptFromStorage(combined.secret, combined.secretIv)
      decrypted = { key, secret }
    } else {
      decrypted = apiKeyVaultService.decryptFromStorage(encrypted_value, iv)
    }

    // Log access
    await pool.query(
      `INSERT INTO api_key_audit_log (user_id, action, key_type, status)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'accessed', keyType, 'success'],
    )

    // Update last_used_at
    await pool.query(
      `UPDATE user_api_keys SET last_used_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND key_type = $2`,
      [userId, keyType],
    )

    res.json({
      status: 'success',
      data: decrypted,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    logger.error({
      type: 'api_key_internal_error',
      userId,
      keyType,
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
    })
    console.error('API Key Decryption Error:', errorMsg)
    res.status(500).json({
      error: 'Failed to retrieve API key',
      details: errorMsg,
    })
  }
})

export default router
