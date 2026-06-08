import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Sidebar() {
  const location = useLocation()
  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Users', path: '/users', icon: '👥' },
    { label: 'Accounts', path: '/accounts', icon: '💼' },
    { label: 'Orders', path: '/orders', icon: '📈' },
    { label: 'Analytics', path: '/analytics', icon: '📉' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
    { label: 'Diagnostics', path: '/diagnostics', icon: '🧪' },
  ]

  const debuggingItems = [
    { label: 'Logs', path: '/logs', icon: '📋' },
    { label: 'Errors', path: '/errors', icon: '🚨' },
    { label: 'Audit Trail', path: '/audit', icon: '📄' },
    { label: 'Debug Sessions', path: '/debug', icon: '🐛' },
  ]

  const teamItems = [
    { label: 'Incidents', path: '/incidents', icon: '🔴' },
    { label: 'Team Coordination', path: '/team', icon: '👨‍💼' },
  ]

  const monitoringItems = [
    { label: 'Performance', path: '/performance', icon: '⚡' },
  ]

  const tradingItems = [
    { label: 'Trading', path: '/trading', icon: '📈' },
  ]

  return (
    <nav style={{
      background: 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)',
      color: 'white',
      width: '256px',
      minHeight: '100vh',
      padding: '24px',
      borderRight: '2px solid #D4AF37',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)'
    }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#D4AF37' : 'transparent',
                  color: isActive ? '#1a1a1a' : '#d1d5db',
                  transition: 'all 200ms',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isActive ? '0 10px 20px rgba(37, 99, 235, 0.3)' : 'none'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => !isActive && (e.currentTarget.style.backgroundColor = '#374151')}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Debugging & Monitoring Section */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #D4AF37' }}>
        <p style={{ color: '#D4AF37', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>
          🔧 Debugging & Monitoring
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {debuggingItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#D4AF37' : 'transparent',
                    color: isActive ? '#1a1a1a' : '#d1d5db',
                    transition: 'all 200ms',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>!isActive && (e.currentTarget.style.backgroundColor = '#374151')}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>!isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Team Coordination Section */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #D4AF37' }}>
        <p style={{ color: '#D4AF37', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>
          👨‍💼 Team & Incidents
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {teamItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#D4AF37' : 'transparent',
                    color: isActive ? '#1a1a1a' : '#d1d5db',
                    transition: 'all 200ms',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>!isActive && (e.currentTarget.style.backgroundColor = '#374151')}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>!isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Performance Monitoring Section */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #D4AF37' }}>
        <p style={{ color: '#D4AF37', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>
          ⚡ Performance
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {monitoringItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#D4AF37' : 'transparent',
                    color: isActive ? '#1a1a1a' : '#d1d5db',
                    transition: 'all 200ms',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>!isActive && (e.currentTarget.style.backgroundColor = '#374151')}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>!isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Trading Section */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #D4AF37' }}>
        <p style={{ color: '#D4AF37', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 12px 0', letterSpacing: '0.5px' }}>
          💹 Trading
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tradingItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#D4AF37' : 'transparent',
                    color: isActive ? '#1a1a1a' : '#d1d5db',
                    transition: 'all 200ms',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>!isActive && (e.currentTarget.style.backgroundColor = '#374151')}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>!isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #D4AF37' }}>
        <p style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', margin: 0 }}>Quick Stats</p>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Active Traders</p>
            <p style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0 0' }}>2.4K</p>
          </div>
          <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Total Volume</p>
            <p style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0 0' }}>₹2.1B</p>
          </div>
        </div>
      </div>
    </nav>
  )
}
