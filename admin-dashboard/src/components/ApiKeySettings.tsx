/**
 * API Key Settings Component
 *
 * Allows users to configure their Claude and Zerodha API keys.
 * Keys are stored securely in browser localStorage.
 * This component is part of the TradingBot feature.
 */

import { useState, useEffect } from 'react'

interface Props {
  onKeysUpdated?: (keys: {
    claudeApiKey: string
    zerodhaApiKey: string
    zerodhaApiSecret: string
  }) => void
}

export const ApiKeySettings = ({ onKeysUpdated }: Props) => {
  const [claudeKey, setClaudeKey] = useState('')
  const [zerodhaKey, setZerodhaKey] = useState('')
  const [zerodhaSecret, setZerodhaSecret] = useState('')
  const [showClaude, setShowClaude] = useState(false)
  const [showZerodha, setShowZerodha] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Load keys from localStorage
    const savedClaude = localStorage.getItem('claudeApiKey') || ''
    const savedZerodha = localStorage.getItem('zerodhaApiKey') || ''
    const savedSecret = localStorage.getItem('zerodhaApiSecret') || ''

    setClaudeKey(savedClaude)
    setZerodhaKey(savedZerodha)
    setZerodhaSecret(savedSecret)
  }, [])

  const handleSaveKeys = () => {
    if (!claudeKey || !zerodhaKey || !zerodhaSecret) {
      setMessage('⚠️ Please fill in all API keys')
      return
    }

    localStorage.setItem('claudeApiKey', claudeKey)
    localStorage.setItem('zerodhaApiKey', zerodhaKey)
    localStorage.setItem('zerodhaApiSecret', zerodhaSecret)

    setMessage('✅ API keys saved successfully!')
    setTimeout(() => setMessage(''), 3000)

    if (onKeysUpdated) {
      onKeysUpdated({
        claudeApiKey: claudeKey,
        zerodhaApiKey: zerodhaKey,
        zerodhaApiSecret: zerodhaSecret,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          🔒 Configure your API keys to enable trading features. Keys are stored locally in your browser.
        </p>
      </div>

      {/* Claude API Key */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">🤖 Claude API Key</h3>
            <a
              href="https://console.anthropic.com/account/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Get your key at console.anthropic.com
            </a>
          </div>
          {claudeKey && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              ✓ Configured
            </span>
          )}
        </div>

        <div className="space-y-2">
          <input
            type={showClaude ? 'text' : 'password'}
            value={claudeKey}
            onChange={(e) => setClaudeKey(e.target.value)}
            placeholder="sk-ant-xxxxxxxxxxxxx"
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <button
            type="button"
            onClick={() => setShowClaude(!showClaude)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showClaude ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Zerodha API Keys */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">📈 Zerodha API Keys</h3>
            <a
              href="https://kite.zerodha.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Get your keys at kite.zerodha.com
            </a>
          </div>
          {zerodhaKey && zerodhaSecret && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              ✓ Configured
            </span>
          )}
        </div>

        <div className="space-y-2">
          <input
            type={showZerodha ? 'text' : 'password'}
            value={zerodhaKey}
            onChange={(e) => setZerodhaKey(e.target.value)}
            placeholder="API Key"
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <input
            type={showZerodha ? 'text' : 'password'}
            value={zerodhaSecret}
            onChange={(e) => setZerodhaSecret(e.target.value)}
            placeholder="API Secret"
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <button
            type="button"
            onClick={() => setShowZerodha(!showZerodha)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showZerodha ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveKeys}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
      >
        💾 Save API Keys
      </button>

      {/* Message */}
      {message && (
        <div className="text-sm p-3 rounded-lg bg-gray-100 text-center">
          {message}
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          🔐 <strong>Security:</strong> API keys are stored locally in your browser (localStorage). They are never sent to our servers unless you make an API call. You can clear them anytime by clearing your browser data.
        </p>
      </div>
    </div>
  )
}
