/**
 * API Key Service
 *
 * Frontend service for managing API keys through secure backend endpoints.
 * - Never stores keys locally
 * - Only stores status (configured/not configured)
 * - All keys encrypted server-side
 */

const API_BASE = 'http://localhost:3000/api/v1'

interface KeyStatus {
  claude: boolean
  zerodha: boolean
}

export const apiKeyService = {
  /**
   * Save API keys (sends to backend, backend encrypts and stores)
   */
  async saveKeys(
    claudeKey?: string,
    zerodhaKey?: string,
    zerodhaSecret?: string,
    userId?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/user/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId || 'default-user',
        },
        body: JSON.stringify({
          claudeApiKey: claudeKey || undefined,
          zerodhaApiKey: zerodhaKey || undefined,
          zerodhaApiSecret: zerodhaSecret || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save keys')
      }

      const data = await response.json()
      return {
        success: true,
        message: data.message,
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to save API keys')
    }
  },

  /**
   * Get API key status (returns only true/false, never actual keys)
   */
  async getStatus(userId?: string): Promise<KeyStatus> {
    try {
      const response = await fetch(`${API_BASE}/user/api-keys/status`, {
        headers: {
          'X-User-ID': userId || 'default-user',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to check API key status')
      }

      const data = await response.json()
      return {
        claude: data.data.claude.configured,
        zerodha: data.data.zerodha.configured,
      }
    } catch (error) {
      console.error('Error checking key status:', error)
      return { claude: false, zerodha: false }
    }
  },

  /**
   * Delete an API key
   */
  async deleteKey(keyType: 'claude' | 'zerodha', userId?: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/user/api-keys/${keyType}`, {
        method: 'DELETE',
        headers: {
          'X-User-ID': userId || 'default-user',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting key:', error)
      return false
    }
  },

  /**
   * Delete all keys
   */
  async deleteAllKeys(userId?: string): Promise<boolean> {
    try {
      const claudeDeleted = await this.deleteKey('claude', userId)
      const zerodhaDeleted = await this.deleteKey('zerodha', userId)
      return claudeDeleted && zerodhaDeleted
    } catch (error) {
      console.error('Error deleting all keys:', error)
      return false
    }
  },
}
