import React, { useState } from 'react'
import { useAuthStore } from '../state/store'

export function Header() {
  const { user, logout } = useAuthStore()
  const [showHelp, setShowHelp] = useState(false)

  const HelpTooltip = () => (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: '0',
      marginTop: '8px',
      backgroundColor: '#1a1a1a',
      border: '2px solid #D4AF37',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '280px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      zIndex: 1000,
      color: 'white',
      fontSize: '13px',
      lineHeight: '1.6'
    }}>
      <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#D4AF37' }}>Need Help?</p>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        <li style={{ marginBottom: '8px' }}>📊 Dashboard - View trading metrics</li>
        <li style={{ marginBottom: '8px' }}>👥 Users - Manage platform users</li>
        <li style={{ marginBottom: '8px' }}>💼 Accounts - Trading account info</li>
        <li style={{ marginBottom: '8px' }}>📈 Orders - Order history & details</li>
        <li style={{ marginBottom: '8px' }}>📉 Analytics - Market insights</li>
      </ul>
      <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
        Version 0.1.0 • Enterprise Edition
      </p>
    </div>
  )

  return (
    <header style={{
      background: 'linear-gradient(to right, #1a1a1a, #2d2d2d)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(212, 175, 55, 0.1)',
      borderBottom: '3px solid #D4AF37',
      padding: '1.2rem 2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Left - Logo and Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#D4AF37',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            boxShadow: '0 4px 16px rgba(212, 175, 55, 0.4)',
            flexShrink: 0
          }}>
            📊
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: 'white',
              margin: '0',
              letterSpacing: '-0.5px'
            }}>
              BOT-TRADE
            </h1>
            <p style={{
              color: '#D4AF37',
              fontSize: '12px',
              margin: '2px 0 0 0',
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              PROFESSIONAL TRADING PLATFORM
            </p>
          </div>
        </div>

        {/* Center - Empty space */}
        <div style={{ flex: 1 }}></div>

        {/* Right - User Info, Help, and Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          justifyContent: 'flex-end'
        }}>
          {user && (
            <>
              {/* User Info */}
              <div style={{
                textAlign: 'right',
                paddingRight: '16px',
                borderRight: '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                <p style={{
                  color: 'white',
                  fontWeight: '600',
                  margin: '0',
                  fontSize: '14px'
                }}>
                  {user.email}
                </p>
                <p style={{
                  color: '#D4AF37',
                  fontSize: '11px',
                  margin: '3px 0 0 0',
                  textTransform: 'capitalize',
                  fontWeight: '500'
                }}>
                  {user.role} • Active
                </p>
              </div>

              {/* Help Button */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    border: '2px solid #D4AF37',
                    color: '#D4AF37',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 200ms'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)'
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(212, 175, 55, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  title="Help & Information"
                >
                  ?
                </button>
                {showHelp && <HelpTooltip />}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#D4AF37',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                  transition: 'all 200ms',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0C851'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4AF37'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                🚪 Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
