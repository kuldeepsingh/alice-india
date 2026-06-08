/**
 * Trading Bot Component
 *
 * Main trading bot interface with two tabs:
 * 1. Settings - Configure API keys
 * 2. Trading - Create orders and test Claude AI features
 *
 * This component is part of the autonomous trading bot system.
 */

import { useState, useEffect } from 'react'
import { ApiKeySettings } from './ApiKeySettings'

interface ApiKeys {
  claudeApiKey: string
  zerodhaApiKey: string
  zerodhaApiSecret: string
}

export const TradingBot = () => {
  const [backendStatus, setBackendStatus] = useState('checking...')
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    claudeApiKey: localStorage.getItem('claudeApiKey') || '',
    zerodhaApiKey: localStorage.getItem('zerodhaApiKey') || '',
    zerodhaApiSecret: localStorage.getItem('zerodhaApiSecret') || '',
  })
  const [activeTab, setActiveTab] = useState<'config' | 'trading'>('config')
  const [symbol, setSymbol] = useState('RELIANCE')
  const [quantity, setQuantity] = useState('10')
  const [price, setPrice] = useState('2850')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Check backend health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:3000/health/live')
        if (response.ok) {
          setBackendStatus('✅ Connected')
        } else {
          setBackendStatus('❌ Cannot reach backend')
        }
      } catch (error) {
        setBackendStatus('❌ Cannot reach backend')
      }
    }
    checkHealth()
  }, [])

  const handleKeysUpdated = (newKeys: ApiKeys) => {
    setApiKeys(newKeys)
  }

  const handleCreateOrder = async () => {
    if (!apiKeys.zerodhaApiKey) {
      alert('❌ Please configure Zerodha API keys in Settings tab first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.zerodhaApiKey}`,
        },
        body: JSON.stringify({
          symbol,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          type: 'BUY',
        }),
      })

      const data = await response.json()
      setResult({
        status: response.ok ? 'success' : 'error',
        data,
      })
    } catch (error) {
      setResult({
        status: 'error',
        data: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestClaude = async () => {
    if (!apiKeys.claudeApiKey) {
      alert('❌ Please configure Claude API key in Settings tab first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/v1/market-analysis/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.claudeApiKey}`,
        },
        body: JSON.stringify({
          symbol: symbol,
          marketData: 'Sample market data for testing',
        }),
      })

      const data = await response.json()
      setResult({
        status: response.ok ? 'success' : 'error',
        data,
      })
    } catch (error) {
      setResult({
        status: 'error',
        data: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 Autonomous Trading Bot</h1>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          backendStatus.includes('Connected')
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          Backend Status: {backendStatus}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'config'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => setActiveTab('trading')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'trading'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Trading
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'config' && (
          <ApiKeySettings onKeysUpdated={handleKeysUpdated} />
        )}

        {activeTab === 'trading' && (
          <div className="space-y-6">
            {/* API Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">🤖 Claude</h3>
                <p className={`text-sm ${apiKeys.claudeApiKey ? 'text-green-600' : 'text-red-600'}`}>
                  {apiKeys.claudeApiKey ? '✅ Ready' : '❌ Not configured'}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">📈 Zerodha</h3>
                <p className={`text-sm ${apiKeys.zerodhaApiKey && apiKeys.zerodhaSecret ? 'text-green-600' : 'text-red-600'}`}>
                  {apiKeys.zerodhaApiKey && apiKeys.zerodhaSecret ? '✅ Ready' : '❌ Not configured'}
                </p>
              </div>
            </div>

            {/* Order Creation */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">📝 Create Test Order</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateOrder}
                disabled={loading || !apiKeys.zerodhaApiKey}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                  apiKeys.zerodhaApiKey
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? '⏳ Creating...' : '📝 Create Order'}
              </button>
            </div>

            {/* Claude Test */}
            <button
              onClick={handleTestClaude}
              disabled={loading || !apiKeys.claudeApiKey}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                apiKeys.claudeApiKey
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? '⏳ Testing...' : '🧠 Test Claude AI'}
            </button>

            {/* Results */}
            {result && (
              <div className={`border rounded-lg p-4 ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className="font-semibold mb-2">
                  {result.status === 'success' ? '✅ Success' : '❌ Error'}
                </h3>
                <pre className="text-sm overflow-auto max-h-64 text-gray-700">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                💡 To enable trading features, configure your API keys in the Settings tab first.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
