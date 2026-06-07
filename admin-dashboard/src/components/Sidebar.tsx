import React from 'react'
import { Link } from 'react-router-dom'

export function Sidebar() {
  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Users', path: '/users' },
    { label: 'Accounts', path: '/accounts' },
    { label: 'Orders', path: '/orders' },
    { label: 'Analytics', path: '/analytics' },
  ]

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className="block px-4 py-2 rounded hover:bg-gray-700"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
