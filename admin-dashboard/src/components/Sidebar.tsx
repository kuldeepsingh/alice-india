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
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = '#374151')}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

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
