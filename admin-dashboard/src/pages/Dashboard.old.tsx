import React, { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'

export function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 2450,
    totalAccounts: 856,
    totalOrders: 12500,
    activeTraders: 1203,
  })

  useEffect(() => {
    setStats({
      totalUsers: 2450,
      totalAccounts: 856,
      totalOrders: 12500,
      activeTraders: 1203,
    })
  }, [])

  const StatCard = ({ title, value, subtitle, icon, gradient }: any) => (
    <div style={{
      background: gradient,
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      transition: 'all 300ms',
      cursor: 'pointer',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}
    onMouseEnter={(e: any) => {
      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.15)'
      e.currentTarget.style.transform = 'translateY(-4px)'
    }}
    onMouseLeave={(e: any) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
      e.currentTarget.style.transform = 'translateY(0)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.8)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 8px 0'
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '36px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 4px 0'
          }}>
            {value.toLocaleString()}
          </p>
          <p style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0
          }}>
            {subtitle}
          </p>
        </div>
        <div style={{ fontSize: '40px' }}>{icon}</div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#0f172a',
            margin: '0 0 8px 0'
          }}>
            Dashboard Overview
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#64748b',
            margin: 0
          }}>
            Real-time statistics and platform metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle="All registered users"
            icon="👥"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            title="Trading Accounts"
            value={stats.totalAccounts}
            subtitle="Active accounts"
            icon="💼"
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            subtitle="All-time trades"
            icon="📊"
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
          <StatCard
            title="Active Traders"
            value={stats.activeTraders}
            subtitle="Trading this month"
            icon="🎯"
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </div>

        {/* Activity Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              margin: 0
            }}>
              Recent Activity
            </h3>
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#0c4a6e',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Last 30 Days
            </span>
          </div>

          {/* Empty State */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '2px dashed #cbd5e1'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#475569',
              margin: '0 0 8px 0'
            }}>
              No recent activity yet
            </p>
            <p style={{
              fontSize: '14px',
              color: '#94a3b8',
              margin: 0
            }}>
              Trading activities and orders will appear here in real-time
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[
            { icon: '👥', title: 'Users', desc: 'Manage all users' },
            { icon: '💼', title: 'Accounts', desc: 'Trading accounts' },
            { icon: '📈', title: 'Orders', desc: 'Order history' },
            { icon: '📉', title: 'Analytics', desc: 'Market insights' }
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 200ms',
              textAlign: 'center'
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9'
              e.currentTarget.style.borderColor = '#cbd5e1'
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.backgroundColor = '#f8fafc'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>
                {item.title}
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
