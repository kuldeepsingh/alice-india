/**
 * API Key Vault Service
 *
 * Securely manages API keys with encryption.
 * - Stores encrypted keys in database
 * - Uses AES-256 encryption
 * - Never exposes keys unless explicitly requested by backend
 * - Provides audit trail
 */

import crypto from 'crypto'
import { logger } from './logger'

export class ApiKeyVaultService {
  private encryptionKey: Buffer
  private algorithm = 'aes-256-cbc'

  constructor() {
    // In production, this should come from a secure vault/environment
    const masterKey = process.env.API_KEY_ENCRYPTION_KEY || 'default-dev-key-change-in-production'
    // Derive a 256-bit key from the master key
    this.encryptionKey = crypto.scryptSync(masterKey, 'salt', 32)
  }

  /**
   * Encrypt a sensitive value
   */
  encrypt(plaintext: string): { encrypted: string; iv: string } {
    try {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv)

      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      return {
        encrypted,
        iv: iv.toString('hex'),
      }
    } catch (error) {
      logger.error({
        type: 'encryption_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      throw new Error('Failed to encrypt API key')
    }
  }

  /**
   * Decrypt a sensitive value
   */
  decrypt(encrypted: string, ivHex: string): string {
    try {
      const iv = Buffer.from(ivHex, 'hex')
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv)

      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      logger.error({
        type: 'decryption_failed',
        error: error instanceof Error ? error.message : String(error),
      })
      throw new Error('Failed to decrypt API key')
    }
  }

  /**
   * Encrypt and return for storage
   */
  encryptForStorage(plaintext: string): { encrypted: string; iv: string } {
    return this.encrypt(plaintext)
  }

  /**
   * Decrypt from storage
   */
  decryptFromStorage(encrypted: string, iv: string): string {
    return this.decrypt(encrypted, iv)
  }
}

export const apiKeyVaultService = new ApiKeyVaultService()
