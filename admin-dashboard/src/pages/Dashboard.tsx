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
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-600 text-sm font-medium">Trading Accounts</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalAccounts}</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-600 text-sm font-medium">Total Orders</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-600 text-sm font-medium">Active Traders</h3>
            <p className="text-3xl font-bold mt-2">{stats.activeTraders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <p className="text-gray-600">No recent activity</p>
        </div>
      </div>
    </Layout>
  )
}
