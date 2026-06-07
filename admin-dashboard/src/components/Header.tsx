import React from 'react'
import { useAuthStore } from '../state/store'

export function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header style={{
      background: 'linear-gradient(to right, #1a1a1a, #2d2d2d)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(212, 175, 55, 0.1)',
      borderBottom: '3px solid #D4AF37',
      padding: '1.5rem 2rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#D4AF37',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
          }}>
            📈
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>Bot-Trade</h1>
            <p style={{ color: '#D4AF37', fontSize: '14px', margin: '4px 0 0 0' }}>Automated Trading Dashboard</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user && (
            <>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'white', fontWeight: '600', margin: '0' }}>{user.email}</p>
                <p style={{ color: '#dbeafe', fontSize: '12px', margin: '4px 0 0 0', textTransform: 'capitalize' }}>{user.role} • Active</p>
              </div>
              <div style={{ width: '1px', height: '32px', backgroundColor: '#D4AF37' }}></div>
              <button
                onClick={logout}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#D4AF37',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                  transition: 'all 200ms'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0C851'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4AF37'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)'
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
