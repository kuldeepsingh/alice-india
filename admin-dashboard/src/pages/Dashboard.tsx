import React, { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'

export function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAccounts: 0,
    totalOrders: 0,
    activeTraders: 0,
  })

  useEffect(() => {
    // Fetch dashboard stats
    setStats({
      totalUsers: 0,
      totalAccounts: 0,
      totalOrders: 0,
      activeTraders: 0,
    })
  }, [])

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 mt-2">Welcome back! Here's your trading platform metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Users</p>
                <p className="text-4xl font-bold text-blue-900 mt-3">{stats.totalUsers || '—'}</p>
                <p className="text-blue-600 text-xs mt-2">Platform wide</p>
              </div>
              <div className="text-5xl">👥</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Trading Accounts</p>
                <p className="text-4xl font-bold text-green-900 mt-3">{stats.totalAccounts || '—'}</p>
                <p className="text-green-600 text-xs mt-2">Active accounts</p>
              </div>
              <div className="text-5xl">💼</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Total Orders</p>
                <p className="text-4xl font-bold text-purple-900 mt-3">{stats.totalOrders || '—'}</p>
                <p className="text-purple-600 text-xs mt-2">All time</p>
              </div>
              <div className="text-5xl">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-semibold uppercase tracking-wide">Active Traders</p>
                <p className="text-4xl font-bold text-orange-900 mt-3">{stats.activeTraders || '—'}</p>
                <p className="text-orange-600 text-xs mt-2">This month</p>
              </div>
              <div className="text-5xl">🎯</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">Last 30 Days</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 font-medium">No recent activity yet</p>
            <p className="text-gray-400 text-sm mt-2">Your trading activities will appear here</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
