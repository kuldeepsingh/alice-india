// @ts-nocheck
/**
 * Credential Service
 * Secure encryption/decryption of API credentials
 */

import crypto from 'crypto'
import { query } from './database.ts'
import { AuditService } from './audit-service.ts'

export interface StoredCredentials {
  apiKey: string
  apiSecret: string
  accessToken?: string
}

export interface CredentialStatus {
  status: 'active' | 'inactive' | 'expired' | 'invalid'
  lastValidatedAt?: Date
  validationError?: string
  lastUsedAt?: Date
}

export class CredentialService {
  // Use a strong encryption key from environment or generate one
  private static readonly encryptionKey =
    process.env.CREDENTIAL_ENCRYPTION_KEY ||
    crypto.scryptSync(process.env.JWT_SECRET || 'default-secret', 'salt', 32)

  private static readonly algorithm = 'aes-256-gcm'
  private static readonly keyVersion = 1

  /**
   * Encrypt sensitive data
   */
  static encrypt(plaintext: string): string {
    try {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv)

      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      const authTag = cipher.getAuthTag()

      // Format: iv:authTag:encrypted
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt credentials')
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encrypted: string): string {
    try {
      const [ivHex, authTagHex, encryptedData] = encrypted.split(':')

      if (!ivHex || !authTagHex || !encryptedData) {
        throw new Error('Invalid encrypted format')
      }

      const iv = Buffer.from(ivHex, 'hex')
      const authTag = Buffer.from(authTagHex, 'hex')

      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv)
      decipher.setAuthTag(authTag)

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt credentials')
    }
  }

  /**
   * Store user credentials
   */
  static async storeCredentials(
    userId: string,
    credentials: StoredCredentials
  ): Promise<void> {
    try {
      // Validate credentials format
      if (!credentials.apiKey || credentials.apiKey.length < 10) {
        throw new Error('Invalid API key format')
      }

      if (!credentials.apiSecret || credentials.apiSecret.length < 10) {
        throw new Error('Invalid API secret format')
      }

      // Encrypt credentials
      const encryptedKey = this.encrypt(credentials.apiKey)
      const encryptedSecret = this.encrypt(credentials.apiSecret)
      const encryptedAccessToken = credentials.accessToken
        ? this.encrypt(credentials.accessToken)
        : null

      // Check if credentials exist
      const existingResult = await query(
        'SELECT id FROM user_trading_credentials WHERE user_id = $1',
        [userId]
      )

      if (existingResult.rows.length > 0) {
        // Update existing
        const sql = `
          UPDATE user_trading_credentials
          SET api_key_encrypted = $1,
              api_secret_encrypted = $2,
              access_token_encrypted = $3,
              status = 'inactive',
              validation_error = NULL,
              updated_at = NOW()
          WHERE user_id = $4
        `

        await query(sql, [encryptedKey, encryptedSecret, encryptedAccessToken, userId])
      } else {
        // Insert new
        const sql = `
          INSERT INTO user_trading_credentials (
            user_id, api_key_encrypted, api_secret_encrypted, access_token_encrypted
          ) VALUES ($1, $2, $3, $4)
        `

        await query(sql, [userId, encryptedKey, encryptedSecret, encryptedAccessToken])
      }

      // Audit log
      await AuditService.createAuditLog({
        userId,
        action: 'CREDENTIALS_STORED',
        resource: 'trading_credentials',
        details: {
          keyPrefix: credentials.apiKey.substring(0, 4),
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Store credentials error:', error)

      // Audit log failure
      await AuditService.createAuditLog({
        userId,
        action: 'CREDENTIALS_STORE_FAILED',
        resource: 'trading_credentials',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  }

  /**
   * Retrieve user credentials
   */
  static async getCredentials(userId: string): Promise<StoredCredentials | null> {
    try {
      const sql = `
        SELECT api_key_encrypted, api_secret_encrypted, access_token_encrypted
        FROM user_trading_credentials
        WHERE user_id = $1
      `

      const result = await query(sql, [userId])

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]

      return {
        apiKey: this.decrypt(row.api_key_encrypted),
        apiSecret: this.decrypt(row.api_secret_encrypted),
        accessToken: row.access_token_encrypted
          ? this.decrypt(row.access_token_encrypted)
          : undefined,
      }
    } catch (error) {
      console.error('Get credentials error:', error)
      throw new Error('Failed to retrieve credentials')
    }
  }

  /**
   * Check if user has credentials
   */
  static async hasCredentials(userId: string): Promise<boolean> {
    try {
      const sql = `
        SELECT EXISTS (
          SELECT 1 FROM user_trading_credentials
          WHERE user_id = $1 AND status = 'active'
        )
      `

      const result = await query(sql, [userId])
      return result.rows[0].exists
    } catch (error) {
      console.error('Has credentials check error:', error)
      return false
    }
  }

  /**
   * Update credential status
   */
  static async updateStatus(
    userId: string,
    status: 'active' | 'inactive' | 'expired' | 'invalid',
    validationError?: string
  ): Promise<void> {
    try {
      const sql = `
        UPDATE user_trading_credentials
        SET status = $1,
            last_validated_at = NOW(),
            validation_error = $2
        WHERE user_id = $3
      `

      await query(sql, [status, validationError || null, userId])
    } catch (error) {
      console.error('Update status error:', error)
      throw error
    }
  }

  /**
   * Mark credentials as used
   */
  static async markAsUsed(userId: string): Promise<void> {
    try {
      const sql = `
        UPDATE user_trading_credentials
        SET last_used_at = NOW()
        WHERE user_id = $1
      `

      await query(sql, [userId])
    } catch (error) {
      console.error('Mark as used error:', error)
    }
  }

  /**
   * Delete user credentials
   */
  static async deleteCredentials(userId: string): Promise<void> {
    try {
      const sql = 'DELETE FROM user_trading_credentials WHERE user_id = $1'

      await query(sql, [userId])

      // Audit log
      await AuditService.createAuditLog({
        userId,
        action: 'CREDENTIALS_DELETED',
        resource: 'trading_credentials',
        details: {
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Delete credentials error:', error)
      throw error
    }
  }

  /**
   * Get credential status
   */
  static async getStatus(userId: string): Promise<CredentialStatus | null> {
    try {
      const sql = `
        SELECT status, last_validated_at, validation_error, last_used_at
        FROM user_trading_credentials
        WHERE user_id = $1
      `

      const result = await query(sql, [userId])

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]

      return {
        status: row.status,
        lastValidatedAt: row.last_validated_at ? new Date(row.last_validated_at) : undefined,
        validationError: row.validation_error,
        lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
      }
    } catch (error) {
      console.error('Get status error:', error)
      throw error
    }
  }

  /**
   * Validate credentials format and connectivity
   */
  static validateFormat(credentials: StoredCredentials): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!credentials.apiKey) {
      errors.push('API key is required')
    } else if (credentials.apiKey.length < 10) {
      errors.push('API key is too short')
    }

    if (!credentials.apiSecret) {
      errors.push('API secret is required')
    } else if (credentials.apiSecret.length < 10) {
      errors.push('API secret is too short')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
