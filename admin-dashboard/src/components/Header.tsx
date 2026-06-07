import React from 'react'
import { useAuthStore } from '../state/store'

export function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header style={{
      background: 'linear-gradient(to right, #2563eb, #1e40af)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      borderBottom: '4px solid #1e3a8a',
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
            backgroundColor: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2563eb',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            🚀
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>Alice India</h1>
            <p style={{ color: '#dbeafe', fontSize: '14px', margin: '4px 0 0 0' }}>Professional Trading Platform</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user && (
            <>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'white', fontWeight: '600', margin: '0' }}>{user.email}</p>
                <p style={{ color: '#dbeafe', fontSize: '12px', margin: '4px 0 0 0', textTransform: 'capitalize' }}>{user.role} • Active</p>
              </div>
              <div style={{ width: '1px', height: '32px', backgroundColor: '#60a5fa' }}></div>
              <button
                onClick={logout}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 200ms'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
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
