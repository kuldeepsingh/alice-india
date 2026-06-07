import React from 'react'
import { Layout } from '../components/Layout'

export function Analytics() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">Trading Analytics</h2>
          <p className="text-gray-500 mt-2">Real-time insights into market performance and user activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Order Trends</h3>
                <span className="text-3xl">📈</span>
              </div>
            </div>
            <div className="p-8">
              <div className="h-48 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl mb-2">📊</p>
                  <p className="text-gray-600 font-medium">Interactive chart coming soon</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Top Traders</h3>
                <span className="text-3xl">🏆</span>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {i}
                      </div>
                      <span className="font-medium text-gray-700">Trader #{i}</span>
                    </div>
                    <span className="text-purple-600 font-bold">₹{(100 * i).toLocaleString()}K</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Market Performance</h3>
                <span className="text-3xl">📉</span>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">NSE Index</span>
                  <span className="text-green-600 font-bold">+2.45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">BSE Index</span>
                  <span className="text-green-600 font-bold">+1.92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">MCX Index</span>
                  <span className="text-red-600 font-bold">-0.58%</span>
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <p className="text-sm text-gray-500">Last updated: 2 minutes ago</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">User Statistics</h3>
                <span className="text-3xl">👥</span>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">Active Users</span>
                    <span className="text-orange-600 font-bold">2,450</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">Growth Rate</span>
                    <span className="text-orange-600 font-bold">+12.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
