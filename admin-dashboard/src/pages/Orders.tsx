import React, { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { ordersAPI } from '../services/api'

export function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const response = await ordersAPI.getAll()
        setOrders(response.data || [])
      } catch (error) {
        console.error('Failed to fetch orders', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Order History</h2>
        
        <div className="bg-white p-6 rounded shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Side</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4">No orders found</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-6 py-4">{order.symbol}</td>
                    <td className="px-6 py-4">{order.side}</td>
                    <td className="px-6 py-4">{order.quantity}</td>
                    <td className="px-6 py-4">₹{order.price}</td>
                    <td className="px-6 py-4">{order.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
