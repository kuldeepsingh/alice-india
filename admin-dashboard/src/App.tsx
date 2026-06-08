import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './state/store'
import { Login } from './pages/Login'
import { DashboardPro as Dashboard } from './pages/DashboardPro'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <Routes>
        {!isAuthenticated && <Route path="/login" element={<Login />} />}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}
