import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Sidebar() {
  const location = useLocation()
  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Users', path: '/users', icon: '👥' },
    { label: 'Accounts', path: '/accounts', icon: '💼' },
    { label: 'Orders', path: '/orders', icon: '📈' },
    { label: 'Analytics', path: '/analytics', icon: '📉' },
  ]

  return (
    <nav className="bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64 min-h-screen p-6 border-r-2 border-gray-700 shadow-xl">
      <ul className="space-y-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-12 pt-6 border-t border-gray-700">
        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Quick Stats</p>
        <div className="mt-4 space-y-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Active Traders</p>
            <p className="text-white text-xl font-bold">2.4K</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Total Volume</p>
            <p className="text-white text-xl font-bold">₹2.1B</p>
          </div>
        </div>
      </div>
    </nav>
  )
}
