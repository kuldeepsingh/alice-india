// @ts-nocheck
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
 * PUT /config/settings
 * Update user settings with comprehensive logging
 */
router.put('/settings', (req: Request, res: Response) => {
  const requestId = `settings-update-${Date.now()}`
  const startTime = Date.now()

  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous'
    const ipAddress = req.ip
    const settings = req.body

    // LOG: Entry point
    logger.debug('Settings', 'Settings update request received', {
      requestId,
      userId,
      settingKeys: Object.keys(settings),
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    // Input validation
    logger.debug('Settings', 'Validating settings parameters', {
      requestId,
      userId,
      hasTheme: 'theme' in settings,
      hasNotifications: 'notifications' in settings,
      hasRiskLimit: 'riskLimit' in settings,
      hasDailySummary: 'dailySummary' in settings,
    })

    // Validate individual settings if provided
    if ('theme' in settings && !['light', 'dark', 'auto'].includes(settings.theme)) {
      const duration = Date.now() - startTime
      logger.warn('Settings', 'Settings validation failed - invalid theme', {
        requestId,
        userId,
        providedTheme: settings.theme,
        allowedThemes: ['light', 'dark', 'auto'],
        durationMs: duration,
      })
      return res.status(400).json({
        status: 'error',
        message: 'Invalid theme. Must be: light, dark, or auto',
        reason: 'invalid_theme',
      })
    }

    if ('riskLimit' in settings && (typeof settings.riskLimit !== 'number' || settings.riskLimit <= 0)) {
      const duration = Date.now() - startTime
      logger.warn('Settings', 'Settings validation failed - invalid risk limit', {
        requestId,
        userId,
        providedRiskLimit: settings.riskLimit,
        durationMs: duration,
      })
      return res.status(400).json({
        status: 'error',
        message: 'Risk limit must be a positive number',
        reason: 'invalid_risk_limit',
      })
    }

    logger.debug('Settings', 'Settings validation passed, preparing update', {
      requestId,
      userId,
      updateFields: Object.keys(settings),
    })

    // Simulate settings update
    const updateStart = Date.now()
    // In real implementation: database update here
    const oldSettings = {
      theme: 'dark',
      notifications: true,
      riskLimit: 100000,
      dailySummary: true,
    }
    const updateDuration = Date.now() - updateStart

    const totalDuration = Date.now() - startTime

    // LOG: Success with before/after
    logger.info('Settings', 'User settings updated successfully', {
      requestId,
      userId,
      updatedFields: Object.keys(settings),
      changes: {
        theme: {
          old: oldSettings.theme,
          new: settings.theme || oldSettings.theme,
          changed: oldSettings.theme !== settings.theme,
        },
        notifications: {
          old: oldSettings.notifications,
          new: settings.notifications !== undefined ? settings.notifications : oldSettings.notifications,
          changed: oldSettings.notifications !== settings.notifications,
        },
        riskLimit: {
          old: oldSettings.riskLimit,
          new: settings.riskLimit || oldSettings.riskLimit,
          changed: oldSettings.riskLimit !== settings.riskLimit,
        },
        dailySummary: {
          old: oldSettings.dailySummary,
          new: settings.dailySummary !== undefined ? settings.dailySummary : oldSettings.dailySummary,
          changed: oldSettings.dailySummary !== settings.dailySummary,
        },
      },
      updateDurationMs: updateDuration,
      totalDurationMs: totalDuration,
      ipAddress,
      timestamp: new Date().toISOString(),
    })

    const updatedSettings = {
      ...oldSettings,
      ...settings,
    }

    res.status(200).json({
      status: 'success',
      message: 'Settings updated successfully',
      data: updatedSettings,
      requestId,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Settings', `Settings update failed: ${errorMessage}`, error, {
      requestId,
      userId: req.headers['x-user-id'] as string || 'anonymous',
      errorMessage,
      durationMs: duration,
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      status: 'error',
      message: 'Failed to update settings',
      reason: 'server_error',
      requestId,
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
