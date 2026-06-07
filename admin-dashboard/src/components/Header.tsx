import React from 'react'
import { useAuthStore } from '../state/store'

export function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-xl border-b-4 border-blue-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-lg text-blue-600 shadow-md">
            🚀
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Alice India</h1>
            <p className="text-blue-100 text-sm">Professional Trading Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {user && (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-white font-semibold">{user.email}</p>
                <p className="text-blue-100 text-xs capitalize tracking-wide">{user.role} • Active</p>
              </div>
              <div className="w-px h-8 bg-blue-400"></div>
              <button
                onClick={logout}
                className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
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
