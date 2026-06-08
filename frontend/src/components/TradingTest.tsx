import { useState, useEffect } from 'react'
import { tradingAPI, marketAPI } from '../services/api-client'
import { ApiKeySettings } from './ApiKeySettings'

interface ApiKeys {
  claudeApiKey: string
  zerodhaApiKey: string
  zerodhaApiSecret: string
}

export const TradingTest = () => {
  const [status, setStatus] = useState('checking...')
  const [orders, setOrders] = useState<any[]>([])
  const [sentiment, setSentiment] = useState<any>(null)
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    claudeApiKey: localStorage.getItem('claudeApiKey') || '',
    zerodhaApiKey: localStorage.getItem('zerodhaApiKey') || '',
    zerodhaApiSecret: localStorage.getItem('zerodhaApiSecret') || '',
  })
  
  const [symbol, setSymbol] = useState('RELIANCE')
  const [quantity, setQuantity] = useState('10')
  const [price, setPrice] = useState('2850')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'trading'>('config')

  // Check backend health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Try the root health endpoint directly
        const response = await fetch('http://localhost:3000/health/live')
        if (response.ok) {
          setStatus('✅ Connected to backend')
        } else {
          setStatus('❌ Cannot reach backend')
        }
      } catch (error) {
        setStatus('❌ Cannot reach backend')
      }
    }
    checkHealth()
  }, [])

  const handleKeysUpdated = (newKeys: ApiKeys) => {
    setApiKeys(newKeys)
    setActiveTab('trading')
  }

  // Create order
  const handleCreateOrder = async () => {
    if (!apiKeys.zerodhaApiKey) {
      alert('❌ Please configure Zerodha API keys first (Settings tab)')
      return
    }

    setLoading(true)
    try {
      const response = await tradingAPI.createOrder({
        symbol,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        orderType: 'LIMIT',
        transactionType: 'BUY',
        validity: 'DAY',
        zerodhaApiKey: apiKeys.zerodhaApiKey,
      })
      alert('✅ Order created: ' + JSON.stringify(response.data))
      setOrders([...orders, response.data])
    } catch (error: any) {
      alert('❌ Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  // Test Claude sentiment analysis
  const handleTestClaude = async () => {
    if (!apiKeys.claudeApiKey) {
      alert('❌ Please configure Claude API key first (Settings tab)')
      return
    }

    setLoading(true)
    try {
      const response = await marketAPI.analyzeSentiment({
        symbol: symbol,
        recentPrice: price,
        priceChange: '2.5',
        volumeChange: '15',
        newsHeadlines: ['Stock performing well'],
        claudeApiKey: apiKeys.claudeApiKey,
      })
      setSentiment(response.data)
      alert('✅ Claude Analysis: ' + JSON.stringify(response.data.data, null, 2))
    } catch (error: any) {
      alert('⚠️ Claude error\n\nError: ' + 
        (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🤖 Autonomous Trading Bot</h1>
      
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
        <p><strong>Backend Status:</strong> {status}</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('config')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'config' ? '#0066cc' : '#f0f0f0',
            color: activeTab === 'config' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px 5px 0 0',
            fontWeight: 'bold'
          }}
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => setActiveTab('trading')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'trading' ? '#0066cc' : '#f0f0f0',
            color: activeTab === 'trading' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px 5px 0 0',
            fontWeight: 'bold'
          }}
        >
          📊 Trading
        </button>
      </div>

      {/* Settings Tab */}
      {activeTab === 'config' && (
        <ApiKeySettings onKeysUpdated={handleKeysUpdated} />
      )}

      {/* Trading Tab */}
      {activeTab === 'trading' && (
        <div>
          {/* API Key Status */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px', 
            marginBottom: '20px' 
          }}>
            <div style={{ 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '5px',
              background: apiKeys.claudeApiKey ? '#d4edda' : '#f8d7da'
            }}>
              <strong>🤖 Claude:</strong> {apiKeys.claudeApiKey ? '✅ Ready' : '❌ Not Configured'}
            </div>
            <div style={{ 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '5px',
              background: apiKeys.zerodhaApiKey ? '#d4edda' : '#f8d7da'
            }}>
              <strong>📈 Zerodha:</strong> {apiKeys.zerodhaApiKey ? '✅ Ready' : '❌ Not Configured'}
            </div>
          </div>

          <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
            <h3>📊 Create Test Order</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <label>Symbol: </label>
              <input 
                value={symbol} 
                onChange={(e) => setSymbol(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Quantity: </label>
              <input 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Price: </label>
              <input 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                step="0.05"
                style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
              />
            </div>

            <button 
              onClick={handleCreateOrder}
              disabled={loading || !apiKeys.zerodhaApiKey}
              style={{ 
                background: apiKeys.zerodhaApiKey ? '#007bff' : '#ccc', 
                color: 'white', 
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: loading || !apiKeys.zerodhaApiKey ? 'not-allowed' : 'pointer',
                marginRight: '10px'
              }}
            >
              {loading ? 'Creating...' : '📉 Create Order'}
            </button>

            <button 
              onClick={handleTestClaude}
              disabled={loading || !apiKeys.claudeApiKey}
              style={{ 
                background: apiKeys.claudeApiKey ? '#28a745' : '#ccc', 
                color: 'white', 
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: loading || !apiKeys.claudeApiKey ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Analyzing...' : '🤖 Test Claude AI'}
            </button>
          </div>

          {sentiment && (
            <div style={{ border: '1px solid #28a745', padding: '15px', marginBottom: '20px', borderRadius: '5px', background: '#f8f9fa' }}>
              <h3>📈 Claude Analysis Result</h3>
              <pre style={{ background: '#fff', padding: '10px', borderRadius: '3px', overflow: 'auto' }}>
                {JSON.stringify(sentiment, null, 2)}
              </pre>
            </div>
          )}

          {orders.length > 0 && (
            <div style={{ border: '1px solid #007bff', padding: '15px', borderRadius: '5px' }}>
              <h3>📋 Created Orders ({orders.length})</h3>
              <ul>
                {orders.map((order, i) => (
                  <li key={i}>
                    {order.symbol} x{order.quantity} @ {order.price}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Help text */}
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: '#e7f3ff', 
            border: '1px solid #b3d9ff',
            borderRadius: '5px'
          }}>
            <strong>📌 How to use:</strong>
            <ul style={{ marginTop: '10px' }}>
              <li>Go to <strong>Settings</strong> tab to add Claude and Zerodha API keys</li>
              <li>Claude key: Get from <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com</a></li>
              <li>Zerodha key: Get from <a href="https://kite.zerodha.com" target="_blank" rel="noopener noreferrer">kite.zerodha.com</a></li>
              <li>Once configured, click "Create Order" or "Test Claude AI"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
