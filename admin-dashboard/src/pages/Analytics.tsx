import React from 'react'
import { Layout } from '../components/Layout'

export function Analytics() {
  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Trading Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Order Trends</h3>
            <p className="text-gray-600">Chart coming soon</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Top Traders</h3>
            <p className="text-gray-600">Leaderboard coming soon</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Market Performance</h3>
            <p className="text-gray-600">Performance metrics coming soon</p>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
            <p className="text-gray-600">User stats coming soon</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
