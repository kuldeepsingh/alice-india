// @ts-nocheck
/**
 * Credentials Routes
 * Manage Zerodha API credentials securely
 */

import { Router, Request, Response } from 'express'
import { requireDeveloper } from '../middleware/rbac.ts'
import { CredentialService } from '../services/credential-service.ts'
import { ZerodhaService } from '../services/zerodha-service.ts'

const router = Router()

/**
 * POST /api/v1/credentials/zerodha
 * Store Zerodha credentials (encrypted)
 */
router.post('/zerodha', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const { apiKey, apiSecret } = req.body
    const userId = (req as any).user.id

    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        status: 'error',
        message: 'apiKey and apiSecret are required',
      })
    }

    // Validate format
    const validation = CredentialService.validateFormat({
      apiKey,
      apiSecret,
    })

    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials format',
        errors: validation.errors,
      })
    }

    // Store encrypted credentials
    await CredentialService.storeCredentials(userId, {
      apiKey,
      apiSecret,
    })

    res.json({
      status: 'success',
      message: 'Credentials stored successfully',
      data: {
        keyPrefix: apiKey.substring(0, 4),
        stored: true,
      },
    })
  } catch (error: any) {
    console.error('Store credentials error:', error)
    res.status(400).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * GET /api/v1/credentials/zerodha/status
 * Get credential status
 */
router.get('/zerodha/status', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const status = await CredentialService.getStatus(userId)

    if (!status) {
      return res.json({
        status: 'success',
        data: {
          hasCredentials: false,
          message: 'No credentials configured',
        },
      })
    }

    res.json({
      status: 'success',
      data: {
        hasCredentials: true,
        ...status,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * POST /api/v1/credentials/zerodha/validate
 * Validate credentials with Zerodha API
 */
router.post('/zerodha/validate', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    // Get stored credentials
    const credentials = await CredentialService.getCredentials(userId)

    if (!credentials) {
      return res.status(404).json({
        status: 'error',
        message: 'No credentials stored',
      })
    }

    // Test with Zerodha API
    try {
      const zerodhaService = new ZerodhaService(
        credentials.apiKey,
        credentials.apiSecret,
        credentials.accessToken
      )

      const profile = await zerodhaService.getProfile()

      // Update status to active
      await CredentialService.updateStatus(userId, 'active')

      res.json({
        status: 'success',
        message: 'Credentials are valid',
        data: {
          userId: profile.userId,
          userName: profile.userName,
          broker: profile.brokerName,
          validated: true,
        },
      })
    } catch (validationError: any) {
      // Update status to invalid
      await CredentialService.updateStatus(
        userId,
        'invalid',
        validationError.message
      )

      res.status(401).json({
        status: 'error',
        message: 'Credentials validation failed',
        error: validationError.message,
        validated: false,
      })
    }
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * DELETE /api/v1/credentials/zerodha
 * Delete Zerodha credentials
 */
router.delete('/zerodha', requireDeveloper, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    await CredentialService.deleteCredentials(userId)

    res.json({
      status: 'success',
      message: 'Credentials deleted successfully',
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

/**
 * GET /api/v1/credentials/zerodha/check
 * Quick check if credentials exist
 */
router.get('/zerodha/check', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'anonymous'

    const hasCredentials = await CredentialService.hasCredentials(userId)

    res.json({
      status: 'success',
      hasCredentials,
      data: {
        hasCredentials,
        configured: hasCredentials,
      },
    })
  } catch (error: any) {
    // Return false rather than error if check fails
    res.json({
      status: 'success',
      hasCredentials: false,
      data: {
        hasCredentials: false,
        configured: false,
      },
    })
  }
})

export default router
