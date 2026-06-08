import { useState, useEffect } from 'react'

interface ApiKeys {
  claudeApiKey: string
  zerodhaApiKey: string
  zerodhaApiSecret: string
}

export const ApiKeySettings = ({ onKeysUpdated }: { onKeysUpdated: (keys: ApiKeys) => void }) => {
  const [keys, setKeys] = useState<ApiKeys>({
    claudeApiKey: localStorage.getItem('claudeApiKey') || '',
    zerodhaApiKey: localStorage.getItem('zerodhaApiKey') || '',
    zerodhaApiSecret: localStorage.getItem('zerodhaApiSecret') || '',
  })
  
  const [showClaude, setShowClaude] = useState(false)
  const [showZerodha, setShowZerodha] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updated = { ...keys, [name]: value }
    setKeys(updated)
  }

  const handleSave = () => {
    // Save to localStorage (client-side)
    localStorage.setItem('claudeApiKey', keys.claudeApiKey)
    localStorage.setItem('zerodhaApiKey', keys.zerodhaApiKey)
    localStorage.setItem('zerodhaApiSecret', keys.zerodhaApiSecret)
    
    // Notify parent component
    onKeysUpdated(keys)
    
    // Show save confirmation
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const hasClaudeKey = !!keys.claudeApiKey
  const hasZerodhaKeys = !!keys.zerodhaApiKey && !!keys.zerodhaApiSecret

  return (
    <div style={{ 
      border: '2px solid #0066cc', 
      padding: '20px', 
      marginBottom: '20px', 
      borderRadius: '8px',
      background: '#f9f9f9'
    }}>
      <h2>🔐 API Configuration</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Configure your API keys to enable trading features. Keys are stored locally in your browser.
        </p>
      </div>

      {saved && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '15px',
          border: '1px solid #c3e6cb'
        }}>
          ✅ API keys saved successfully!
        </div>
      )}

      {/* Claude API Key Section */}
      <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>🤖 Claude API Key</h3>
          <span style={{ 
            background: hasClaudeKey ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '3px',
            fontSize: '12px'
          }}>
            {hasClaudeKey ? '✓ Configured' : '✗ Not Set'}
          </span>
        </div>
        
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
          Get your key at: <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com/account/keys</a>
        </p>

        {!showClaude ? (
          <button 
            onClick={() => setShowClaude(true)}
            style={{
              background: '#0066cc',
              color: 'white',
              padding: '8px 15px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {hasClaudeKey ? 'Update Key' : 'Add Key'}
          </button>
        ) : (
          <div>
            <input
              type="password"
              name="claudeApiKey"
              placeholder="sk-ant-xxxxxxxxxxxxx"
              value={keys.claudeApiKey}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginBottom: '10px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
            <button
              onClick={() => setShowClaude(false)}
              style={{
                background: '#6c757d',
                color: 'white',
                padding: '8px 15px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Hide
            </button>
          </div>
        )}
      </div>

      {/* Zerodha API Key Section */}
      <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>📈 Zerodha API Keys</h3>
          <span style={{ 
            background: hasZerodhaKeys ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '3px',
            fontSize: '12px'
          }}>
            {hasZerodhaKeys ? '✓ Configured' : '✗ Not Set'}
          </span>
        </div>
        
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
          Get your credentials from: <a href="https://kite.zerodha.com" target="_blank" rel="noopener noreferrer">kite.zerodha.com</a>
        </p>

        {!showZerodha ? (
          <button 
            onClick={() => setShowZerodha(true)}
            style={{
              background: '#0066cc',
              color: 'white',
              padding: '8px 15px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {hasZerodhaKeys ? 'Update Keys' : 'Add Keys'}
          </button>
        ) : (
          <div>
            <input
              type="password"
              name="zerodhaApiKey"
              placeholder="Zerodha API Key"
              value={keys.zerodhaApiKey}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginBottom: '10px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
            <input
              type="password"
              name="zerodhaApiSecret"
              placeholder="Zerodha API Secret"
              value={keys.zerodhaApiSecret}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginBottom: '10px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
            <button
              onClick={() => setShowZerodha(false)}
              style={{
                background: '#6c757d',
                color: 'white',
                padding: '8px 15px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Hide
            </button>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        style={{
          background: '#28a745',
          color: 'white',
          padding: '12px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        💾 Save API Keys
      </button>

      {/* Security Notice */}
      <div style={{
        background: '#e7f3ff',
        border: '1px solid #b3d9ff',
        padding: '10px',
        borderRadius: '5px',
        marginTop: '15px',
        fontSize: '12px',
        color: '#004085'
      }}>
        🔒 <strong>Security:</strong> API keys are stored locally in your browser (localStorage). 
        They are never sent to our servers without your explicit action. Clear your browser data to remove them.
      </div>
    </div>
  )
}
