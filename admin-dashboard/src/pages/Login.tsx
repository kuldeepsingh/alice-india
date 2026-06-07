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
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

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
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #151515 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '60px',
        maxWidth: '1200px',
        width: '100%',
        alignItems: 'center'
      }}>
        {/* Left side - Professional Branding */}
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Header */}
          <div>
            <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'pulse 2s infinite' }}>🤖</div>
            <h1 style={{
              fontSize: '56px',
              fontWeight: '800',
              margin: '0 0 16px 0',
              lineHeight: '1.1',
              background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Bot-Trade
            </h1>
            <p style={{
              fontSize: '24px',
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 32px 0',
              fontWeight: '300',
              lineHeight: '1.4'
            }}>
              Professional Automated Trading Platform for Indian Markets
            </p>
          </div>

          {/* Key Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: '⚡', title: 'Real-time Analytics', desc: 'Live market data & insights' },
              { icon: '🔐', title: 'Bank-Grade Security', desc: 'Enterprise-level protection' },
              { icon: '📊', title: 'Advanced Charts', desc: 'Professional trading tools' },
              { icon: '🌍', title: 'Multi-Broker', desc: 'Support for all major brokers' }
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  borderLeft: '3px solid #D4AF37',
                  transition: 'all 300ms',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.1)'
                  e.currentTarget.style.transform = 'translateX(8px)'
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <div style={{ fontSize: '28px' }}>{feature.icon}</div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '15px' }}>{feature.title}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            {[
              { value: '2.4K+', label: 'Active Users' },
              { value: '12.5K+', label: 'Trades Daily' },
              { value: '₹2.1B', label: 'Volume' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#D4AF37',
                  margin: '0 0 4px 0'
                }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login Form */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
          padding: '48px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {/* Title */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 8px 0'
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0
            }}>
              Sign in to your trading dashboard
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
              fontWeight: '500',
              animation: 'slideDown 300ms ease-out'
            }}>
              ⚠️ {error}
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
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  fontSize: '16px'
                }}>👤</span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 200ms',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37'
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="admin"
                  required
                />
              </div>
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
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  fontSize: '16px'
                }}>🔐</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 200ms',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37'
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: loading ? '#999999' : 'linear-gradient(135deg, #D4AF37 0%, #F0C851 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 300ms',
                boxShadow: loading ? 'none' : '0 8px 20px rgba(212, 175, 55, 0.3)',
                opacity: loading ? 0.7 : 1,
                letterSpacing: '0.3px'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 99, 235, 0.4)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.3)')}
            >
              {loading ? '🔄 Logging in...' : '🚀 Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #7dd3fc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '700', margin: '0 0 12px 0' }}>
              ✨ Demo Credentials:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '13px',
              color: '#0c4a6e'
            }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: '8px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Option 1</p>
                <p style={{ margin: '0', fontSize: '11px', fontFamily: 'monospace' }}>admin / admin</p>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', padding: '8px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Option 2</p>
                <p style={{ margin: '0', fontSize: '11px', fontFamily: 'monospace' }}>admin@test.com / admin</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p style={{
            fontSize: '12px',
            color: '#94a3b8',
            textAlign: 'center',
            margin: 0,
            lineHeight: '1.6'
          }}>
            🌐 Enterprise Edition • v0.1.0<br/>
            <span style={{ fontSize: '11px' }}>© 2026 Bot-Trade. All rights reserved.</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 'repeat(auto-fit"] {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
        }
      `}</style>
    </div>
  )
}
