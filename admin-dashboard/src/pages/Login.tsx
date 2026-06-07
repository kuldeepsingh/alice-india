import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/store'
import { authAPI } from '../services/api'

export function Login() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const [email, setEmail] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login(email, password)
      const { token, user } = response.data

      setToken(token)
      setUser(user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Left side - Branding (hidden on mobile) */}
      <div style={{
        flex: 1,
        paddingRight: '40px',
        display: 'none',
        '@media (minWidth: 1024px)': { display: 'block' },
        color: 'white'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 16px 0', lineHeight: '1.2' }}>
            Bot-Trade
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', margin: '0 0 32px 0' }}>
            Professional Automated Trading Platform
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '16px' }}>
            {['Real-time Market Data', 'Multi-broker Support', 'Advanced Analytics'].map((feature, i) => (
              <li key={i} style={{ marginBottom: '12px', color: 'rgba(255,255,255,0.8)' }}>
                ✓ {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        padding: '48px 40px',
        background: 'linear-gradient(to bottom, #ffffff, #f8fafc)'
      }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#0f172a',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #2563eb, #0369a1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Bot-Trade
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>
            Admin Dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ marginBottom: '24px' }}>
          {/* Username Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              Username or Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 200ms',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
              placeholder="admin"
              required
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 200ms',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #0369a1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 200ms',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)')}
          >
            {loading ? '🔄 Logging in...' : '🚀 Login'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', margin: '0 0 8px 0' }}>
            📝 Demo Credentials:
          </p>
          <div style={{ fontSize: '13px', color: '#0c4a6e', margin: 0, lineHeight: '1.6' }}>
            <strong>Option 1:</strong> admin / admin<br/>
            <strong>Option 2:</strong> admin@test.com / admin
          </div>
        </div>

        {/* Status */}
        <p style={{
          fontSize: '12px',
          color: '#64748b',
          textAlign: 'center',
          margin: 0,
          lineHeight: '1.5'
        }}>
          ✓ Backend running on http://localhost:3000<br/>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>v0.1.0 • Enterprise Edition</span>
        </p>
      </div>
    </div>
  )
}
