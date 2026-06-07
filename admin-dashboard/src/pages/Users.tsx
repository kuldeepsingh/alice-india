import React, { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { usersAPI } from '../services/api'

export function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const response = await usersAPI.getAll()
        setUsers(response.data || [])
      } catch (error) {
        console.error('Failed to fetch users', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">User Management</h2>
        
        <div className="bg-white p-6 rounded shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-4">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-4">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:underline">Edit</button>
                    </td>
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
