import React, { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { accountsAPI } from '../services/api'

export function Accounts() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true)
      try {
        const response = await accountsAPI.getAll()
        setAccounts(response.data || [])
      } catch (error) {
        console.error('Failed to fetch accounts', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Trading Accounts</h2>
        
        <div className="bg-white p-6 rounded shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Label</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Broker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-4">Loading...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-4">No accounts found</td></tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="border-t">
                    <td className="px-6 py-4">{account.accountLabel}</td>
                    <td className="px-6 py-4">{account.brokerType}</td>
                    <td className="px-6 py-4">{account.status}</td>
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
